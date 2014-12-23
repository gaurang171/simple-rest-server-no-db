'use strict';

var fs = require('fs');

function validateModelName(req,res,next,name){
	if(name.slice(-1)==='s'){
		next();
	} else {
		res.status(404).jsonp({message:'Invalid model name'});
	};
}

function getFiles(dir){
	var files = fs.readdirSync(dir);
	if(files.length){
		files.sort(function(a,b){
			a = parseInt(a);
			b = parseInt(b);
			return a - b;
		});
	}
	return files;
}

function listItems(req,res){
	//console.log(req.params,req.body,req.query);
	var name = req.params.modelName;
	var dir = './data/'+name;
	if(!fs.existsSync(dir)){
		return res.status(404).jsonp({message:'Not Found'});
	}
	var list = [];
	var files = getFiles(dir);
	for (var i=0;i<files.length;i++) {
		list.push(JSON.parse(fs.readFileSync(dir+'/'+files[i])+""));
	};
	res.jsonp(list);
}

function createItem(req,res){
	var name = req.params.modelName;
	var dir = './data/'+name;
	var fileName;
	if(req.body.id){
		res.status(400).jsonp({message:'You can not have id while creating item'});
	}
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir);
		fileName = "1.json";
		req.body.id = 1;
	} else {
		var files = getFiles(dir);
		req.body.id = 1 + parseInt(files[files.length-1]);
		fileName = req.body.id + '.json';
	}
	fs.writeFileSync(dir+'/'+fileName, JSON.stringify(req.body));
	res.jsonp(req.body);
}

/*Get items handled by static router. if here its not found*/
function getItem(req,res){
	res.status(404).jsonp({message:'Requested Item not found'});
}

function modifyItem(req,res){
	var name = req.params.modelName;
	var dir = './data/'+name;
	if(!fs.existsSync(dir)){
		return res.status(404).jsonp({message:'Not Found'});
	}
	var id = req.params.id/1;
	if(req.body.id != req.params.id){
		res.status(400).jsonp({message:'Invalid Request'});
	}
	fs.writeFileSync(dir+'/'+id+'.json', JSON.stringify(req.body));
	res.jsonp(req.body);
}

module.exports = function(app) {
	app.route('/:modelName')
		.get(listItems)
		.post(createItem);
	app.route('/:modelName/:id')
		.get(getItem)
		.post(modifyItem)
		.put(modifyItem);
	app.param('modelName',validateModelName);
};