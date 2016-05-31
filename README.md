# VS Code Plugin for Lebab

> [Lebab](https://github.com/mohebifar/lebab) transpiles your ES5 code to ES2015. It does exactly the opposite of what Babel does.

![lebab](https://cloud.githubusercontent.com/assets/7034281/15670926/9803ba10-2730-11e6-9501-69427ce21902.gif)

## Install

To install, press `F1` and select `Extensions: Install Extensions` and then search for and select `lebab`.

This plugin does not require global Lebab installation.

## Usage

Press `F1` and run the command named `Lebab: convert JavaScript code from ES5 to ES2015`.

## Options

All options are available in the [official repository Lebab](https://github.com/mohebifar/lebab/blob/master/README.md#features-and-known-limitations).

By default enabled only safe transforms:

  * arrow
  * let
  * arg-spread
  * obj-method
  * obj-shorthand
  * no-strict
  * commonjs

## Keyboard shortcuts

For changes keyboard shortcuts, create a new rule in `File -> Preferences -> Keyboard Shortcuts`:

```json
{
  "key": "ctrl+shift+c",
  "command": "lebab.convert"
}
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/vscode-lebab/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
