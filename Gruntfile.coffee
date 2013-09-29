module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.loadNpmTasks 'grunt-umd'

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean:
      dist:
        'Cocktail.js'

    jshint:
      options:
        jshintrc: '.jshintrc'
      dist:
        files:
          src: 'lib'

    umd:
      dist:
        src: 'lib/Cocktail.js'
        dest: 'Cocktail.js'
        objectToExport: 'Cocktail'
        globalAlias: 'Cocktail'
        deps:
          defaults: ['Backbone', '_']
          amd: ['backbone', 'underscore']
          cjs: ['backbone', 'underscore']

    grunt.registerTask 'default', [
      'clean'
      'jshint'
      'umd'
    ]
