const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'escudo.png');
const outputPath = path.join(__dirname, 'public', 'escudo_trans.png');

console.log('Reading ' + inputPath);

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const w = this.width;
    const h = this.height;

    // Use a queue for flood fill to avoid max call stack/deep recursion issues of a stack
    const queue = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    
    // Seen array instead of Set for performance and memory (w*h)
    const seen = new Uint8Array(w * h);

    // Any pixel brighter than this will be considered white
    const threshold = 220; 

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      if (x < 0 || x >= w || y < 0 || y >= h) continue;

      const i = y * w + x;
      if (seen[i]) continue;
      seen[i] = 1;

      const pos = y * w * 4 + x * 4;

      const r = this.data[pos];
      const g = this.data[pos + 1];
      const b = this.data[pos + 2];
      const a = this.data[pos + 3];

      // If it's a white-ish pixel
      if (a > 0 && r >= threshold && g >= threshold && b >= threshold) {
        // Anti-aliasing edges fix: if it's very bright, make it completely transparent
        // If it's borderline, make it semi-transparent
        if (r > 245 && g > 245 && b > 245) {
          this.data[pos + 3] = 0; // Alpha 0
        } else {
          // Soft edge
          this.data[pos + 3] = Math.max(0, this.data[pos + 3] - 150); 
        }

        // Add neighbors
        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }

    this.pack().pipe(fs.createWriteStream(outputPath))
      .on('finish', () => console.log('Successfully created escudo_trans.png!'));
  })
  .on('error', err => {
    console.log('Error processing PNG:', err);
  });
