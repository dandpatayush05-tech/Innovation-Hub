const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.git') || file.includes('dist') || file.includes('.temp') || file.includes('scratch')) {
            if (!--pending) done(null, results);
            return;
          }
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk(__dirname, (err, results) => {
  if (err) throw err;
  
  let count = 0;
  results.forEach(file => {
    if (!file.match(/\.(ts|tsx|md|html|css|json)$/)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace Vstara -> Yatra Setu, but try to avoid css vars and tailwind classes
    // E.g. we want to avoid replacing "vstara" in "bg-vstara-dark" or "--color-vstara"
    
    // Replace standalone or capitalized versions
    content = content.replace(/Vstara/g, 'Yatra Setu');
    content = content.replace(/VSTARA/g, 'YATRA SETU');
    
    // For lowercase vstara, only replace if it's not preceded by a dash or followed by a dash (CSS classes)
    content = content.replace(/(?<!-)\bvstara\b(?!-)/g, 'Yatra Setu');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated:', file);
      count++;
    }
  });
  console.log('Total files updated:', count);
});
