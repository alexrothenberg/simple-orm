abort "Please use Ruby 1.9" if RUBY_VERSION !~ /^1\.9/

require "bundler/setup"

def pipeline
  require 'rake-pipeline'
  Rake::Pipeline::Project.new("Assetfile")
end

desc "Build browser-model.js"
task :dist do
  puts "Building..."
  pipeline.invoke
  puts "Done"
end

desc "Clean build artifacts from previous builds"
task :clean do
  puts "Cleaning build..."
  rm_rf "dist"
  puts "Done"
end
