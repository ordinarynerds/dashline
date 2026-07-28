# Changelog

## [0.12.0](https://github.com/ordinarynerds/dashline/compare/v0.11.0...v0.12.0) (2026-07-28)


### Features

* spend widget for the week's cost across sessions ([0fe75c1](https://github.com/ordinarynerds/dashline/commit/0fe75c1bcbf65ff9abb5799636d242d60789c1ba))


### Bug Fixes

* **playground:** lift the commit scope out of the changelog markdown ([b253fb4](https://github.com/ordinarynerds/dashline/commit/b253fb420025efe0eaa87362c3e87c025d34da21))

## [0.11.0](https://github.com/ordinarynerds/dashline/compare/v0.10.0...v0.11.0) (2026-07-25)


### Features

* eight new widgets and item chrome drawn once per datum ([718a165](https://github.com/ordinarynerds/dashline/commit/718a165428de9d0fe7024d211deadc6862fc81b2))
* per-item text styles (bold, italic, underline) ([4d208a7](https://github.com/ordinarynerds/dashline/commit/4d208a764f258e8dac21dea14910692cc7584a8f))
* **playground:** builder rework, docs, and hosting at dashline.ordinarynerds.com ([a7996a2](https://github.com/ordinarynerds/dashline/commit/a7996a2daeaeb9a26da7ede929786454ff48bc2b))
* **playground:** interactive dashline builder with live preview ([ad0a7ce](https://github.com/ordinarynerds/dashline/commit/ad0a7ce20d51aaa0501a39504d88a3b6af32763e))


### Bug Fixes

* apply text styles across the whole percent widget and label icons ([99d6381](https://github.com/ordinarynerds/dashline/commit/99d638144f05fa01d2426551be2ae64377605ecf))
* **playground:** wire thresholds into preview colors and style widget icons ([dbc1fc7](https://github.com/ordinarynerds/dashline/commit/dbc1fc7babeff3875e89ede2d9737ab54547a11c))

## [0.10.0](https://github.com/ordinarynerds/dashline/compare/v0.9.0...v0.10.0) (2026-07-24)


### Features

* present context history as a "history" variant, not a widget ([102166b](https://github.com/ordinarynerds/dashline/commit/102166be747ae05910241fbea10153de85530afb))

## [0.9.0](https://github.com/ordinarynerds/dashline/compare/v0.8.0...v0.9.0) (2026-07-24)


### Features

* wave 2 visuals — themes, gradient bars, trend, reverse powerline, icons ([dbff49d](https://github.com/ordinarynerds/dashline/commit/dbff49d4c7676ce475a43c9063f66c5285c353e8))


### Bug Fixes

* bound untrusted numeric config and harden the render path ([9cb044f](https://github.com/ordinarynerds/dashline/commit/9cb044f709957077ee1f6c43a5311eaebab2133b))
* give each session its own state file to remove the write race ([b0218dc](https://github.com/ordinarynerds/dashline/commit/b0218dc523ee57b0cc8f7747189ec2f5a2def1c5))

## [0.8.0](https://github.com/ordinarynerds/dashline/compare/v0.7.0...v0.8.0) (2026-07-24)


### Features

* session history with sparkline and burn-rate widgets ([1eceac9](https://github.com/ordinarynerds/dashline/commit/1eceac959c7157a4c73602e9a8bd3708b6f20863))

## [0.7.0](https://github.com/ordinarynerds/dashline/compare/v0.6.0...v0.7.0) (2026-07-24)


### Features

* powerline mode for arrow-joined zone segments ([51c09a9](https://github.com/ordinarynerds/dashline/commit/51c09a9200f5f9919411152b59234178290775d3))


### Bug Fixes

* clip overflowing lines instead of wrapping the terminal ([7b8074a](https://github.com/ordinarynerds/dashline/commit/7b8074a772fe97142b12e41170a59be8f021ce41))

## [0.6.0](https://github.com/ordinarynerds/dashline/compare/v0.5.0...v0.6.0) (2026-07-24)


### Features

* background colors for badge-style items ([7e5ef05](https://github.com/ordinarynerds/dashline/commit/7e5ef05a96d4c857c354fa64111a964a88bc81fc))

## [0.5.0](https://github.com/ordinarynerds/dashline/compare/v0.4.0...v0.5.0) (2026-07-24)


### Features

* support hex colors for 24-bit truecolor ([1920e6a](https://github.com/ordinarynerds/dashline/commit/1920e6a440d91a5655441d9245f30aa6486ab5a1))


### Bug Fixes

* count wide and zero-width characters for correct alignment ([742d978](https://github.com/ordinarynerds/dashline/commit/742d9787b8a23679841f6c4c86fe1f749a2e38ea))

## [0.4.0](https://github.com/ordinarynerds/dashline/compare/v0.3.0...v0.4.0) (2026-07-24)


### Features

* add session id support on name widget ([1cabdc9](https://github.com/ordinarynerds/dashline/commit/1cabdc971e664aff904bc76c461ab1a20421a05c))

## [0.3.0](https://github.com/ordinarynerds/dashline/compare/v0.2.0...v0.3.0) (2026-07-24)


### Features

* add self-update flow and automated releases ([7d9b857](https://github.com/ordinarynerds/dashline/commit/7d9b857799b8b0ffcfe707faf17234bff0e33894))
