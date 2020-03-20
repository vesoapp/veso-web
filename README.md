<h1 align="center">Jellyfin Web</h1>
<h3 align="center">Part of the <a href="https://veso.org">Jellyfin Project</a></h3>

---

<p align="center">
<img alt="Logo Banner" src="https://raw.githubusercontent.com/veso/veso-ux/master/branding/SVG/banner-logo-solid.svg?sanitize=true"/>
<br/>
<br/>
<a href="https://github.com/vesotv/veso-web">
<img alt="GPL 2.0 License" src="https://img.shields.io/github/license/veso/veso-web.svg"/>
</a>
<a href="https://github.com/vesotv/veso-web/releases">
<img alt="Current Release" src="https://img.shields.io/github/release/veso/veso-web.svg"/>
</a>
<a href="https://translate.veso.org/projects/veso/veso-web/?utm_source=widget">
<img src="https://translate.veso.org/widgets/veso/-/veso-web/svg-badge.svg" alt="Translation Status"/>
</a>
<br/>
<a href="https://opencollective.com/veso">
<img alt="Donate" src="https://img.shields.io/opencollective/all/veso.svg?label=backers"/>
</a>
<a href="https://features.veso.org">
<img alt="Feature Requests" src="https://img.shields.io/badge/fider-vote%20on%20features-success.svg"/>
</a>
<a href="https://forum.veso.org">
<img alt="Discuss on our Forum" src="https://img.shields.io/discourse/https/forum.veso.org/users.svg"/>
</a>
<a href="https://matrix.to/#/+veso:matrix.org">
<img alt="Chat on Matrix" src="https://img.shields.io/matrix/veso:matrix.org.svg?logo=matrix"/>
</a>
<a href="https://www.reddit.com/r/veso">
<img alt="Join our Subreddit" src="https://img.shields.io/badge/reddit-r%2Fveso-%23FF5700.svg"/>
</a>
</p>

Jellyfin Web is the frontend used for most of the clients available for end users, such as desktop browsers, Android, and iOS. We welcome all contributions and pull requests! If you have a larger feature in mind please open an issue so we can discuss the implementation before you start. Translations can be improved very easily from our <a href="https://translate.veso.org/projects/veso/veso-web">Weblate</a> instance. Look through the following graphic to see if your native language could use some work!

<a href="https://translate.veso.org/engage/veso/?utm_source=widget">
<img src="https://translate.veso.org/widgets/veso/-/veso-web/multi-auto.svg" alt="Detailed Translation Status"/>
</a>

## Build Process

### Dependencies

- Yarn

### Getting Started

1. Clone or download this repository.
   ```sh
   git clone https://github.com/vesotv/veso-web.git
   cd veso-web
   ```
2. Install build dependencies in the project directory.
   ```sh
   yarn install
   ```

3. Run the web client with webpack for local development.
   ```sh
   yarn serve
   ```
