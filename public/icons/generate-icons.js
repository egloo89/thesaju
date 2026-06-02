// Run: node generate-icons.js
// This creates placeholder icons - replace with actual PNG files for production

const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#0A0A0F" rx="40"/>
  <polygon points="96,8 152,32 184,88 184,104 152,160 96,184 40,160 8,104 8,88 40,32"
    fill="none" stroke="#C9A84C" stroke-width="3"/>
  <circle cx="96" cy="96" r="56" fill="none" stroke="#C9A84C" stroke-width="2" stroke-dasharray="8 4"/>
  <circle cx="96" cy="96" r="36" fill="#12121A"/>
  <text x="96" y="112" text-anchor="middle" fill="#C9A84C" font-size="40" font-family="serif" font-weight="bold">八</text>
</svg>`;

fs.writeFileSync('icon.svg', svgContent);
console.log('SVG icon created. Convert to PNG using a tool like sharp or Inkscape:');
console.log('  icon-192.png (192x192)');
console.log('  icon-512.png (512x512)');
console.log('  apple-touch-icon.png (180x180)');
