# Change Log

All notable changes will be documented in this file.

## [1.2.3] - 2016-01-24

### Changed

- Updated dependencies for both `commonmark` and `commonmark-react-parser` to work around an embarrasing oversight on my part.

## [1.2.2] - 2016-01-08

### Changed

- Reverted change from 1.2.1 that uses the dist version. Instead, documentation is added that specified the need for `json-loader` to be enabled when using webpack.

## [1.2.1] - 2015-12-29

### Fixed

- Use pre-built (dist version) of commonmark renderer in order to work around JSON-loader dependency.

## [1.2.0] - 2015-12-16

### Added

- Added new `allowNode`-property. See README for details.

## [1.1.4] - 2015-12-14

### Fixed

- Set correct `libraryTarget` to make UMD builds work as expected

## [1.1.3] - 2015-12-14

### Fixed

- Update babel dependencies and run prepublish only as actual prepublish, not install

## [1.1.1] - 2015-11-28

### Fixed

- Fixed issue with React external name in global environment (`react` vs `React`)

## [1.1.0] - 2015-11-22

### Changed

- Add ability to allow/disallow specific node types (`allowedTypes`/`disallowedTypes`)

## [1.0.5] - 2015-10-22

### Changed

- Moved React from dependency to peer dependency.

[1.2.1]: https://github.com/rexxars/react-markdown/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/rexxars/react-markdown/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/rexxars/react-markdown/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/rexxars/react-markdown/compare/v1.1.1...v1.1.3
[1.1.1]: https://github.com/rexxars/react-markdown/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/rexxars/react-markdown/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/rexxars/react-markdown/compare/85a0e625ad1fefc6af2cb779c6ee74db5f31f866...v1.0.5
