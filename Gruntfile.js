module.exports = function(grunt) {

    "use strict";

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-csslint");
    grunt.loadNpmTasks("grunt-html");

    function expandFiles(files) {
        return grunt.util._.pluck( grunt.file.expandMapping( files ), "src" ).map(function( values ) {
            return values[ 0 ];
        });
    }

    grunt.initConfig({
        htmllint: {
            // ignore files that contain invalid html, used only for ajax content testing
            all: grunt.file.expand(["docs/**/*.html", "tests/**/*.html"]).filter(function(file) {
                return !/(?:ajax\/content\d\.html|tabs\/data\/test\.html|tests\/unit\/core\/core.*\.html)/.test(file);
            })
        },
        qunit: {
            files: expandFiles("tests/unit/*.html").filter(function(file) {
                // disabling everything that doesn't (quite) work with PhantomJS for now
                // TODO except for all|index|test, try to include more as we go
                return !(/(all)\.html$/).test(file);
            })
        },
        jshint: {
            ui: {
                options: {
                    jshintrc: "src/.jshintrc"
                },
                files: {
                    src: "src/js/*.js"
                }
            },
            grunt: {
                options: {
                    jshintrc: ".jshintrc"
                },
                files: {
                    src: ["Gruntfile.js"]
                }
            },
            tests: {
                options: {
                    jshintrc: "tests/.jshintrc"
                },
                files: {
                    src: "tests/unit/**/*.js"
                }
            }
        },
        csslint: {
            base_theme: {
                src: "src/css/*.css",
                options: {
                    csslintrc: ".csslintrc"
                }
            }
        }
    });

    grunt.registerTask("default", ["lint", "test"]);
    grunt.registerTask("lint", ["jshint", "csslint", "htmllint"]);
    grunt.registerTask("test", ["qunit"]);
};
