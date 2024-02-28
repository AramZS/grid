var showdown = require("showdown");
var fs = require("fs");
// var md = require('markdown-it')();
const { resolve } = require('path');
const { readdir } = require('fs').promises;
// via https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}


const convert = function(text) {
  // showdown.extension('myext', myext);
  var converter = new showdown.Converter({
    strikethrough: true,
    simpleLineBreaks: false,
    tasklists: true,
    metadata: true
  });
  converter.setFlavor("original");
  // var html = md.render(text);
  var html = converter.makeHtml(text);
  var metadata = converter.getMetadata();
  return { ...metadata, content: html };
};

const getData = function() {
  const datagridFolder = "./text-datagrid/";
  return new Promise((resolve, reject) => {
    fs.readdir(datagridFolder, function(err, filenames) {
      if (err) {
        console.log("could not read folder of datagrid", err);
        resolve(false);
        return;
      } else {
        console.log('Datagrid files ', filenames)
        const data = filenames.map(function(filename) {
          return convert( fs.readFileSync(datagridFolder + filename, "utf-8") );
        });
        resolve(data);
      }
    });
  });
};

const getGridSet = async function() {
  const datagridFolder = "./text-datagrid/";
  const fileList = await getFiles(datagridFolder);
  const data = fileList.map(filename => convert(fs.readFileSync(filename, "utf-8")))
  // const data = await getData();
  const gridSet = {};
  data.forEach(dataItem => {
    // console.log(dataItem)
    try {
      if (gridSet.hasOwnProperty(dataItem.topic)) {
        gridSet[dataItem.topic].data.push(dataItem);
        gridSet[dataItem.topic].tags = gridSet[dataItem.topic].tags.concat(dataItem.tags.split(','));
      } else {
        gridSet[dataItem.topic] = { data: [dataItem], tags: dataItem.tags.split(',') }
      }
    } catch (e) {
      console.log("Data item missing topic ", e, dataItem);
    }
  });
  return gridSet;
};

module.exports = {
  getGridSet
};
