# Combined Academic Website Template

This repository contains a combined template that merges two excellent academic website templates:

1. **Main Page Template**: Based on [Jon Barron's academic website](https://github.com/jonbarron/jonbarron.github.io) - provides a clean, professional main page for academic profiles
2. **Project Pages Template**: Based on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template) - provides detailed project presentation pages

## File Structure

```
website/
├── index.html               # Main website (Jon Barron template)
├── stylesheet.css           # Main stylesheet
├── data/                    # Documents (CV, papers, etc.)
├── images/                  # Website images and favicon
├── projects/
│   ├── template/            # Template for new projects (Academic Project Page Template)
│   │   ├── index.html       # Template HTML
│   │   └── README.md        # Template documentation
│   └── static/              # Shared resources
│       ├── css/
│       │   └── template.css # Template stylesheet
│       └── js/
│           └── template.js  # Template JavaScript
└── README.md               # This file
```

## Usage Manual

### Setting Up Your Main Page

1. **Edit Personal Information** (`index.html`):
   - Update name, title, and bio in the main content area
   - Replace profile photo in `images/` folder
   - Update links (email, CV, GitHub, etc.)

2. **Customize Styling** (`stylesheet.css`):
   - Modify colors, fonts, and layout
   - Adjust responsive breakpoints
   - Customize hover effects and animations

3. **Add Projects**:
   - Create project entries in the main page
   - Link to individual project pages
   - Update project images and descriptions

### Creating New Project Pages

1. **Copy Template**:
   ```bash
   cp -r projects/template/ projects/your-project-name/
   ```

2. **Edit Project Content** (`projects/your-project-name/index.html`):
   - Update project title, authors, and dates
   - Add project description and abstract
   - Include technical details and methodology
   - Add links to papers, code, or demos

3. **Add Media Files**:
   - Create `images/` folder in your project directory
   - Add project images, videos, and diagrams
   - Optimize media for web (use WebP format when possible)

4. **Customize Styling**:
   - Modify `static/css/template.css` for project-specific styling
   - Add custom CSS for unique layouts
   - Ensure responsive design

### Best Practices
  - Use WebP format for better compression
  - Provide appropriate alt text
  - Optimize image sizes for web
  - Use clear headings and structure
  - Include relevant links and citations
  - Optimize media files

## Credits

- **Main Page Template**: [Jon Barron's academic website](https://github.com/jonbarron/jonbarron.github.io) - Clean, professional academic profile design
- **Project Pages Template**: [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template) by Eliahu Horwitz - Detailed project presentation framework

This combined template provides the best of both worlds: a professional main page for your academic profile and detailed project pages for showcasing your research and work.

## License

This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License, following the same license as the original templates.

## Contributing

Suggestions and improvements are welcome. :)