jQuery(function($){
	var dialogPolyfill = require("./dialog-polyfill.js");
	var aTemplate = require("./aTemplate.js");
	var saveAs = require("./fileSaver.min.js").saveAs;
	var JSZip = require("./jszip.min.js");
	require("./jszip-deflate.js")(JSZip);
	require("./jszip-inflate.js")(JSZip);
	var defaultStyle = require("./defaultStyle.js");
	var marked = require("./marked.js");
	var parser = require("./templateParser.js");
	var compiler = require("./compiler.js");
	var slackWidget = require("./slack-widget.js");
	var editor = {};
	var i18n = jQuery.i18n.browserLang();
	var lang;
	var storageName = "atomic-lab";
	if(i18n == 'ja'){
		lang = "ja";
	}else{
		lang = "en";
	}
	var material = {
		atom:0,
		molucule:1,
		organism:2,
		template:3
	};
	var cssLab = new aTemplate.View({
		templates:[
			"css_preview",
			"css_edit",
			"css_search_result",
			"css_search",
			"css_setting",
			"css_new",
			"css_about",
			"css_io",
			"css_cheat",
			"css_share",
			"css_remove",
			"css_exp"
		],
		data:{
			lang:lang,
			components:[],
			name:"",
			newName:"",
			css:"",
			html:"",
			newCategory:"atom",
			category:"",
			about:"",
			editMode:"preview",
			markup:"ejs",
			styling:"sass",
			search:"",
			searchCategory:["true","true","true","true"],
			searchStatus:"inactive",
			cheatCategory:"",
			cheatAbout:"",
			cheatName:"",
			searchResults:function(){
				var search = this.data.search;
				var components = this.data.components;
				var searchCategory = this.data.searchCategory;
				return components
				.sort(function(a,b){
					if(material[a.category] < material[b.category]){
						return 1;
					}else if(material[a.category] === material[b.category]){
						if(a.name > b.name){
							return 1;
						}else{
							return -1;
						}
					}else{
						return -1;
					}
				})
				.filter(function(comp){
					if(searchCategory[material[comp.category]] != "true"){
						return false;
					}
					return comp.name.indexOf(search) >= 0;
				});
			}
		},
		method:{
			initialize:function(){
				if(location.hash){
					var zip = new JSZip();
					var hash = location.hash
			    var strings = JSZip.base64.decode(hash);
    			strings = JSZip.compressions.DEFLATE.uncompress(strings);
    			strings = decodeURI(strings);
			    var data = JSON.parse(strings);
			    for(var key in data){
		      	this.data[key] = data[key];
		      }
		      location.hash = "";
				}else{
					this.setData(defaultStyle);
					this.loadData(storageName);
					var comp = this.data.components[0];
					if(comp){
						this.data.id = comp.id
						this.data.html = comp.html;
						this.data.css = comp.css;
						this.data.category = comp.category;
						this.data.name = comp.name;
					}
				}
				this.update();
				if(this.data.editMode != "preview" && this.data.editMode != "about"){
					this.applyMethod("runEditor",this.data.editMode);
				}
			},
			openShareDialog:function(){
				var that = this;
				var zip = new JSZip();
				var data = this.data;
				var strings = JSON.stringify(data);
<<<<<<< HEAD
				zip.file('data', strings);
				var hash = zip.generate({ type: "base64" });
=======
				var hash = encodeURI(strings);
				hash = JSZip.compressions.DEFLATE.compress(hash);
    		hash = JSZip.base64.encode(hash);
>>>>>>> master
				var key = "AIzaSyDNu-_s700JSm7SXzLWVt3Rku5ZwbpaQZA";
				location.hash = hash;
				var url = location.href;
				location.hash = "";
				$.ajax({
					url: "https://www.googleapis.com/urlshortener/v1/url?key=" + key,
	        type: "POST",
	        contentType: "application/json; charset=utf-8",
	        data: JSON.stringify({
	          longUrl: url,
	        }),
	        dataType: "json",
	        success: function(res) {
	        	that.data.shortenedUrl = res.id;
	        	that.update("html","css_share");
						slackWidget();
	        	var dialog = document.querySelector(".js-share-dialog");
	        	dialogPolyfill.registerDialog(dialog);
						dialog.showModal();
	        },
				})
			},
			closeShareDialog:function(){
				var dialog = document.querySelector(".js-share-dialog");
				dialog.close();
			},
			//after updated
			onUpdated:function(){
				this.saveData(storageName);
			},
			showAlert:function(msg){
				var $alert = $("<div class='sourceCopied'>"+msg+"</div>");
				$("body").append($alert);
				$alert.delay(1).queue(function(next){
				  $(this).addClass("active");
				  next();
				}).delay(700).queue(function(next){
				  $(this).removeClass('active');
				  next();
				}).delay(200).queue(function(next){
				  $(this).remove();
				  next();
				});
			},
			changeStyle:function(target){
				this.update("html","css_preview");
				this.saveData(storageName);
			},
			editComp:function(i){
				var data = this.data;
				var components = this.getComputedProp("searchResults");
				var comp = components[i];
				this.data.css = comp.css;
				this.data.name = comp.name;
				this.data.html = comp.html;
				this.data.category = comp.category;
				this.data.about = comp.about;
				this.data.id = comp.id;
				if(this.data.editMode != "preview" && this.data.editMode != "about"){
					editor.destroy();
				}
				this.update("html","css_search_result");
				this.update("html","css_edit");
				this.update("html","css_preview");
				componentHandler.upgradeDom();
				if(this.data.editMode != "preview" && this.data.editMode != "about"){
					this.applyMethod("runEditor",this.data.editMode);
				}
			},
			deleteComp:function(){
				var id = this.data.id;
				var comps = this.data.components;
				for(var i = 0,n = comps.length; i < n; i++){
					if(comps[i].id == id){
						comps.splice(i,1);
						break;
					}
				}
				this.removeData(["html","css","name","category"]);
				this.update("html","css_search_result");
				this.update("html","css_edit");
				this.update("html","css_preview");
				if(this.data.editMode != "preview" && this.data.editMode != "about"){
					this.applyMethod("runEditor",this.data.editMode);
				}
				this.saveData(storageName);
				componentHandler.upgradeDom();
			},
			outputComp:function(){
				var zip = new JSZip();
				zip.file("setting.json", JSON.stringify({components:this.data.components}));
				var content = zip.generate({type:"blob"});
		  	saveAs(content, "css-lab.zip");
			},
			searchComponents:function(){
				this.data.searchStatus = "active";
				this.update("html","css_search_result");
				componentHandler.upgradeDom();
			},
			convertCompToHtml:function(word){
				var data = this.data.components;
				var html = "";
				for(var i = 0,n = data.length; i < n; i++){
					if(data[i].name == word){
						html = "<style>"+data[i].css+"</style>"+data[i].html;
					}
				}
				return html;
			},
			getUniqueId:function(){
				var components = this.data.components;
				var id = this.getRandText(15);
				var flag = false;
				while(1){
					for(var i = 0,n = components.length; i < n; i++){
						if(components[i].id == id){
							flag = true;
						}
					}
					if(flag === false){
						break;
					}
				}
				return id;
			},
			saveComponent:function(e){
				var data = this.data;
				var components = this.data.components;
				var flag = false;
				for(var i = 0,n = components.length; i < n; i++){
					var comp = components[i];
					if(comp.id == data.id){
						comp.html = data.html;
						comp.css = data.css;
						comp.name = data.name;
						comp.id = data.id;
						comp.category = data.category;
						comp.about = data.about;
					}
				}
				this.applyMethod("showAlert","コンポーネントを保存しました。");
				this.update("html","css_search_result");
				componentHandler.upgradeDom();
				this.saveData(storageName);
			},
			addComponent:function(){
				var data = this.data;
				var id = this.applyMethod("getUniqueId");
				var obj = {html:"",css:"",name:data.newName,id:id,category:data.newCategory};
				var components = this.data.components;
				var dialog = document.querySelector(".js-new-dialog");
				dialog.close();
				this.data.components.push(obj);
				this.data.newName = "";
				this.data.newCategory = "atom";
				this.applyMethod("showAlert","コンポーネントを追加しました。");
				this.update("html","css_search_result");
				this.update("html","css_new");
				componentHandler.upgradeDom();
				this.saveData(storageName);
			},
			readSetting:function(){
				var evt = this.e;
				var files = evt.target.files;
				var that = this;
				for (var i = 0, f; f = files[i]; i++) {
					var reader = new FileReader();
					reader.onload = (function(theFile) {
						var json = theFile.target.result.replace("data:application/json;base64,","");
						json = atob(json);
						json = JSON.parse(json);
						that.setData(json);
						that.update();
					});
					reader.readAsDataURL(f);
				}
			},
			changeMode:function(mode){
				if(this.data.editMode != "preview" && this.data.editMode != "about"){
					editor.destroy();
				}
			  	this.data.editMode = mode;
				this.update();
				componentHandler.upgradeDom();
				if(this.data.editMode != "preview" && this.data.editMode != "about"){
					this.applyMethod("runEditor",this.data.editMode);
				}
			},
			openCheatDialog:function(i){
				this.e.stopPropagation();
				var components = this.getComputedProp("searchResults");
				var comp = components[i];
				this.data.cheatAbout = comp.about;
				this.data.cheatCategory = comp.category;
				this.data.cheatName = comp.name;
				this.update("html","css_cheat");
				var dialog = document.querySelector(".js-cheat-dialog");
				dialogPolyfill.registerDialog(dialog);
				dialog.showModal();
			},
			closeCheatDialog:function(){
				var dialog = document.querySelector(".js-cheat-dialog");
				dialog.close();
			},
			openDialog:function(){
				var dialog = document.querySelector(".js-new-dialog");
				dialogPolyfill.registerDialog(dialog);
				dialog.showModal();
			},
			closeDialog:function(){
				var dialog = document.querySelector(".js-new-dialog");
				dialog.close();
			},
			openEditDialog:function(){
				this.update("html","css_about");
				componentHandler.upgradeDom();
				var dialog = document.querySelector(".js-edit-dialog");
				dialogPolyfill.registerDialog(dialog);
				dialog.showModal();
			},
			closeEditDialog:function(){
				var dialog = document.querySelector(".js-edit-dialog");
				dialog.close();
			},
			openRemoveDialog:function(){
				var dialog = document.querySelector(".js-remove-dialog");
				dialogPolyfill.registerDialog(dialog);
				dialog.showModal();
			},
			closeRemoveDialog:function(){
				var dialog = document.querySelector(".js-remove-dialog");
				dialog.close();
			},
			removeAllComponent:function(){
				var dialog = document.querySelector(".js-remove-dialog");
				dialog.close();
				this.data.components = [];
				this.saveData(storageName);
				this.applyMethod("showAlert","すべてのコンポーネントを削除しました。");
				this.update("html","css_search_result");
				componentHandler.upgradeDom();
			},
			doneEditDialog:function(){
				this.applyMethod("closeEditDialog");
				this.applyMethod("saveComponent");
				this.update("html","css_edit");
			},
			clearEditor:function(){
				this.removeData(['name','html','css']);
				this.saveData(storageName);
				this.update();
				if(this.data.editMode != "preview"){
					this.applyMethod("runEditor",this.data.editMode);
				}
				componentHandler.upgradeDom();
			},
			openSettingDialog:function(){
				var dialog = document.querySelector(".js-setting-dialog");
				dialogPolyfill.registerDialog(dialog);
				dialog.showModal();
			},
			closeSettingDialog:function(){
				var dialog = document.querySelector(".js-setting-dialog");
				dialog.close();
			},
			openAboutDialog:function(){
				var dialog = document.querySelector(".js-about-dialog");
				dialogPolyfill.registerDialog(dialog);
				dialog.showModal();
			},
			closeAboutDialog:function(){
				var dialog = document.querySelector(".js-about-dialog");
				dialog.close();
			},
			isGreaterThan:function(text){
				var cat = this.data.category;
				if(material[cat] > material[text]){
					return true;
				}else{
					return false;
				}
			},
			runEditor:function(name){
				var that = this;
				var mode = "";
				if(name == "html"){
					mode = this.data.markup;
				}else if(name == "css"){
					mode = this.data.styling;
				}
				editor = ace.edit("js-"+name);
				editor.setTheme("ace/theme/monokai");
				editor.getSession().setMode("ace/mode/"+name);
				editor.setOptions({
					enableBasicAutocompletion: true,
					enableSnippets: true,
					enableLiveAutocompletion: true
				});
				editor.commands.addCommand({
					name:"save",
					bindKey:{win:"Ctrl+S",mac:"Command-S"},
					exec: function(){
						that.data[name] = editor.getSession().getValue();
						that.applyMethod("saveComponent");
					}
				});
				editor.commands.on("exec",function(e){
					if(e.command && (e.command.name == "reload" || e.command.name == "save")){
						e.preventDefault();
						e.command.exec();
					}
				});
				editor.getSession().on('change',function(e){
					that.data[name] = editor.getSession().getValue();
				});
			}
		},
		convert:{
			preview:function(text){
				var components = this.data.components;
				//textからpreview取得
				var preview = parser.getPreview(text);
				//previewからコメント文取得
				var imports = "";
				// テンプレート取得
				while(1){
					var comment = parser.getComment(preview);
					if(!comment){
						break;
					}
					//commentからコンポーネント名取得
					var name = parser.getComponentName(comment);
					var flag = false;
					for(var i = 0,n = components.length; i < n; i++){
						var comp = components[i];
						if(name == comp.name){
							flag = true;
							//例えば、atomはmoluculeをincludeできない
							imports += parser.getImports(comp.html);
							if(this.data.id !== comp.id && !this.applyMethod("isGreaterThan",comp.category)){
								preview = preview.replace(comment,"");
								break;
							}
							// importされてなければ使えない
							if(this.data.id !== comp.id && imports.indexOf(name) == -1){
								preview = preview.replace(comment,"");
								break;
							}
							var template = parser.getTemplate(comp.html);
							var html = parser.getInnerHtmlFromTemplate(template);
							//templateに自身が含まれていたら削除(無限ループ回避)
							html = parser.removeSelf(html,comp.name);
							var defs = parser.getVarsFromTemplate(template);
							var overrides = parser.getVars(comment);
							html = parser.getRendered(html,defs,overrides);
							preview = preview.replace(comment,compiler.markup[this.data.markup](html));
							break;
						}
					}
					if(!flag){
						preview = preview.replace(comment,"");
					}
				}
				//スタイルシート取得
				for(var i = 0,n = components.length; i < n; i++){
					var comp = components[i];
					if(imports.indexOf(comp.name) !== -1 || this.data.id == comp.id){
						preview += "<style>"+compiler.styling[this.data.styling](comp.css)+"</style>";
					}
				}
				//todo delete
				return parser.removeScript(preview);
			},
			deleteScriptTag:function(data){
				return parser.removeScript(data);
			},
			markdown:function(data){
				return marked(data);
			}
		}
	}).applyMethod("initialize");
});
