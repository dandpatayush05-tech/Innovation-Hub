import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';

export const getConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  let query = supabase.from('conversations').select(`
    *,
    traveler:users!traveler_id(id, name, email),
    business:businesses!business_id(id, business_name, user_id)
  `);

  if (role === 'traveler') {
    query = query.eq('traveler_id', userId);
  } else if (role === 'business') {
    // Need to fetch business first or use a join
    const { data: business } = await supabase.from('businesses').select('id').eq('user_id', userId).single();
    if (business) {
      query = query.eq('business_id', business.id);
    } else {
      return res.json({ data: [] });
    }
  }

  const { data: conversations, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch conversations', details: error.message } });
  }

  res.json({ data: conversations });
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const conversationId = req.params.id;
  
  // Verify access
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('traveler_id, business_id, businesses(user_id)')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return res.status(404).json({ error: { message: 'Conversation not found' } });
  }

  const isTraveler = req.user!.id === conversation.traveler_id;
  const isBusinessOwner = req.user!.id === (conversation.businesses as any).user_id;

  if (!isTraveler && !isBusinessOwner && req.user!.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = (page - 1) * limit;

  const { data: messages, count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch messages', details: error.message } });
  }

  const total = count || 0;
  res.json({
    data: messages || [],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  let conversationId = req.params.id;
  const { content, business_id } = req.body;
  const senderId = req.user!.id;

  // If conversationId is 'new', we need to find or create the conversation
  if (conversationId === 'new') {
    if (!business_id) {
      return res.status(400).json({ error: { message: 'business_id is required to start a new conversation' } });
    }
    
    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('traveler_id', senderId)
      .eq('business_id', business_id)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      // Create new conversation
      const { data: newConv, error: createConvError } = await supabase
        .from('conversations')
        .insert({ traveler_id: senderId, business_id: business_id })
        .select()
        .single();
        
      if (createConvError || !newConv) {
        return res.status(500).json({ error: { message: 'Failed to create conversation', details: createConvError?.message } });
      }
      conversationId = newConv.id;
    }
  } else {
    // Verify access to existing conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('traveler_id, business_id, businesses(user_id)')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: { message: 'Conversation not found' } });
    }

    const isTraveler = senderId === conversation.traveler_id;
    const isBusinessOwner = senderId === (conversation.businesses as any).user_id;

    if (!isTraveler && !isBusinessOwner && req.user!.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    })
    .select()
    .single();

  if (error || !message) {
    return res.status(500).json({ error: { message: 'Failed to send message', details: error?.message } });
  }

  // Update conversation updated_at
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

  res.status(201).json({ data: message });
};
