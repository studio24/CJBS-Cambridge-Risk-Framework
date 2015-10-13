# Cambridge Risk Framework

This project is built using Foundation for Apps. It's powered by Node, Gulp, Angular, and libsass.

## Requirements

You'll need the following software installed to get started.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.
  * [Git](http://git-scm.com/downloads): Use the installer for your OS.
    * Windows users can also try [Git for Windows](http://git-for-windows.github.io/).
  * [Ruby](https://www.ruby-lang.org/en/): Use the installer for your OS. For Windows users, [JRuby](http://jruby.org/) is a popular alternative.
    * With Ruby installed, run `gem install bundler sass` on your command line.
  * [Gulp](http://gulpjs.com/) and [Bower](http://bower.io): Run `npm install -g gulp bower`. If you are on a mac, you may need to prefix this command with `sudo ` and then enter your system password.

## Get Started

In your Git Bash terminal, navigate to the folder where you want to store you local copy of this repository and then clone the repository.

```bash
git clone https://github.com/studio24/CJBS-Cambridge-Risk-Framework.git
```

Change into the directory.

```bash
cd CJBS-Cambridge-Risk-Framework
```

Install the dependencies. Running `npm install` will also automatically run `bower install` after. If you're running Mac OS or Linux, you may need to run `sudo npm install` instead, depending on how your machine is configured. Running `bundle` will install the correct version of Sass for the template.

```bash
npm install
bower install
bundle
```

While you're working on your project you can run:

```bash
npm start
```

This will compile the Sass and assemble your Angular app. **Now go to `localhost:8080` in your browser to see it in action.**

To run the compiling process once, without watching any files:

```bash
npm start build
```

Once you have run all of these steps, you will have a deployable version of the compiles app in the 'build' folder. You can simply place these files onto your web sever and the app will work.