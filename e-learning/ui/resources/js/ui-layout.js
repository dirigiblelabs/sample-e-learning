/*
 * Copyright (c) 2010-2020 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 * Contributors:
 * SAP - initial API and implementation
 */

var ViewRegistry = function() {
	
	var _views = {};
	
	var _factories = {};
	
	this.factory = function(name, func){
		if(arguments.length == 1)
			return _factories[name];
			
		if(typeof func !== 'function')
			throw Error('Not a function');
		_factories[name] = func;
		return this;
	}
	
	this.factories = function(){
		return _factories;
	}
	
	this.view = function(viewid, factory, region, label, settings){
		if(viewid === undefined)
			throw Error('Illegal argument for viewid ' + viewid);
		//get view
		if(arguments.length == 1)
			return _views[viewid];
		//set view
		if(factory === undefined)
			throw Error('Illegal argument for factory ' + factory);
		var componentName;
		if(typeof factory === 'string')
			componentName = factory;
		else if(typeof factory === 'function'){
			this.factory(viewid, factory);
			componentName = viewid;
		}
		region = region || 'center-bottom';
		settings = settings || [];
		settings.label = label;
		
		_views[viewid] = {
			id: viewid,
			type: 'component',
			componentName: componentName,
			componentState: settings,
			defaultRegionId: region
		}
		return this;
	};
	
	this.views = function(){
		return _views;
	}
	
	return this;
	
};

function LayoutController(viewRegistry, messageHub){

	this.viewRegistry = viewRegistry;
	
	this.regions = {
		'main': {
			id: 'main',
			type: 'row',
			isClosable: false
		},
		'left': {
			id: 'left',
			type: 'column',
			width: 30,
			defaultRegionId: 'main'
		},
		'left-top': {
			id: 'left-top',
			type: 'stack',
			defaultRegionId: 'left'
		},
		'left-middle': {
			id: 'left-middle',
			type: 'stack',
			defaultRegionId: 'left'
		},
		'left-bottom': {
			id: 'left-bottom',
			type: 'stack',
			defaultRegionId: 'left'
		},
		'center': {
			id: 'center',
			type: 'column',
			defaultRegionId: 'main'
		},
		'center-top': {
			id: 'center-top',				
			type: 'stack',
			defaultRegionId: 'center'
		},
		'center-middle': {
			id: 'center-middle',				
			type: 'stack',
			defaultRegionId: 'center'
		},
		'center-bottom': {
			id: 'center-bottom',				
			type: 'stack',
			defaultRegionId: 'center'
		},
		'right': {
			id: 'right',
			type: 'column',
			defaultRegionId: 'main'
		},
		'right-top': {
			id: 'right-top',
			type: 'stack',
			defaultRegionId: 'right'
		},
		'right-middle': {
			id: 'right-middle',
			type: 'stack',
			defaultRegionId: 'right'
		},
		'right-bottom': {
			id: 'right-bottom',
			type: 'stack',
			defaultRegionId: 'right'
		}
	}
	
	var parentIds = function(node, regionId, arr){
		arr = arr || [];
		var _parentId = regionId || node.defaultRegionId;
		if(!_parentId)
			return arr;
		if(this.regions[_parentId]){
			arr.push(_parentId);
			return parentIds.call(this, this.regions[_parentId], undefined, arr);
		}
		return arr;
	};
	
	var copy = function(src){
		return JSON.parse(JSON.stringify(src));	
	};
	
	var gridItem = function(top, id){
		if(top.id === id)
			return top;
		if(top.content){
			var item = top.content.find(function(_item){
				return gridItem(_item, id);
			});
			return item && gridItem(item, id)
		}
	};
	
	var addView = function(views, view, grid){
		var node;
		var path = [view.id].concat(parentIds.call(this, view));
		//build branches top-bottom				
		path.reverse().forEach(function(compId, idx, arr){
			var _gridNode = gridItem(grid, compId);
			if(_gridNode){
				node = _gridNode;
				return;//next
			} else {
				var child = this.regions[compId] || views[compId];
				if(child){
					child = copy(child);
					if(!node.content)
						node.content = [];	
					if(!node.content.find(function(it){return it.id == child.id}))
						node.content.push(child);
					node = child;
				}
			}
		}.bind(this));
	}.bind(this);
	
	this.layoutViews = function(views){
		var grid = copy(this.regions.main);
		if(views){
			Object.values(views).map(function(view){
				if(view){
					view = copy(view);
					addView(views, view, grid);			
				}
				return view;
			}.bind(this));
		}	
		return grid;
	}.bind(this);
	
	this.messageHub = messageHub || new FramesMessageHub();
	
	this.listeners = {};
	
	this.addListener = function(eventType, callback){
		if(!this.listeners[eventType]){
			this.listeners[eventType] = [];
		}
		var subscriber = this.messageHub.subscribe(callback.bind(this), eventType);

		var entry = {
			id: uuidv4(),
			handler: subscriber
		};
		this.listeners[eventType].push(entry);
		return entry.id;
	};		
	this.removeListener = function(id, eventType){
		if(!this.listeners[eventType])
			return;
		for (var i = this.listeners[eventType].length - 1; i >= 0; i--) {
		  if (this.listeners[eventType][i].id == id) {
			var subscriber = this.listeners[eventType][i].handler;
			this.messageHub.unsibscribe(subscriber);
			this.listeners[eventType].splice(i, 1);
		  }
		}
	};
	/**
	 * Provide id to enable save/restore state for browser's localStorage. No id will implicitly always reconstruct the instance and will not attempt future state changes save.
	 * Providing an id and the reconstruct flag set to true will not retrive from local storage last state, but will subscribe and save the reconstructed instance future changes.
	 * The layout will be always reconstructed on first init regardless of the reconstruct flag.
	 */
	this.init = function(containerEl, viewNames, id, reconstruct){
		
		this.containerEl = containerEl;
		this.viewNames = viewNames;
		id = id || $(containerEl).attr("id");
		
		if(id){
			if(!reconstruct){
				//load from localStorage
				var savedState = localStorage.getItem('DIRIGIBLE.application.e-learning.'+ id);
				if(savedState !== null) {
					this.config = JSON.parse(savedState);
				}				
			}
		} 
		if(!id || reconstruct || !this.config){
			//reconstruct (ignore previously saved state)
			var views = {};
			this.viewNames.forEach(function(viewName){
				views[viewName] = this.viewRegistry.view(viewName);
			}.bind(this));
			this.config = {
				dimensions: {
					headerHeight: 26,
					borderWidth: 3
				},
				content: [this.layoutViews.call(this, views)]
			};
		}

		let focusView = localStorage.getItem("DIRIGIBLE.application.e-learning.focusView");
		if (this.config.content[0] && this.config.content[0].content[0] && this.config.content[0].content[0].content[0] && this.config.content[0].content[0].content[0].content) {
			let activeItemIndex = 0;
			for (let i = 0; i < this.config.content[0].content[0].content[0].content.length; i ++) {
				let contentView = this.config.content[0].content[0].content[0].content[i];
				if (contentView.id === focusView) {
					activeItemIndex = i;
					break;
				}
			}
			this.config.content[0].content[0].content[0].activeItemIndex = activeItemIndex;
		}

		this.layout = new GoldenLayout(this.config, containerEl);
		
		Object.keys(this.viewRegistry.factories()).forEach(function(factoryname){
			this.layout.registerComponent(factoryname, this.viewRegistry.factory(factoryname));
		}.bind(this));
		
		if(id){
			this.layout.on('stateChanged', function(){
				//TODO: debounce or do that only with save button! This fires a lot
				var state = JSON.stringify( this.layout.toConfig() );
				localStorage.setItem('DIRIGIBLE.application.e-learning.'+ id, state );
			}.bind(this));			
		}
		
		this.layout.init();
	};
	
	this.openView = function(viewId/*, region*/){
		var viewDef = this.viewRegistry.view(viewId);
		if(viewDef){
			var node;
			var defaultPath = [viewId];
			defaultPath = defaultPath.concat(parentIds.call(this, viewDef/*, region*/));//TODO: consider custom region
			defaultPath.reverse().forEach(function(compId){
				if(!node)
					node = this.layout.root;
				else
					node = this.layout.root.getItemsById(node.id || node.config.id)[0];
				var child = node.getItemsById(compId)[0] || this.regions[compId] || this.viewRegistry.view(compId);
				if(!node.isRoot && child && this.layout.root.getItemsById(child.id || child.config.id).length<1){
					node.addChild(child);
				}
				node = child;
			}.bind(this));
		}
	};
	
	this.openEditor = function(resourcePath, resourceLabel, contentType, editorId){
		var newItemConfig = {
			id: resourcePath,
			title: resourceLabel,
			type: 'component',
			componentName: 'editor',
			componentState:{ 
				path: resourcePath,
				editorId: editorId,
				contentType: contentType
			}
		};
		//is an editor available to stack new children to it?
		if(this.layout.root.getItemsById('editor')[0]){
			//is already open?
			if(this.layout.root.getItemsById(newItemConfig.id).length){
				//replace content
				var panel = this.layout.root.getItemsById(newItemConfig.id)[0];
				//panel.instance.setContent(newItemConfig.id)
				panel.parent.setActiveContentItem(panel);
			} else {
				// open new tab
				this.layout.root.getItemsById('editor')[0].parent.addChild( newItemConfig );
			}
		} else {
			this.openView('editor');
			this.layout.root.getItemsById('editor')[0].parent.addChild( newItemConfig );
		}		
	}
	
	this.resize = function(){
		this.layout.updateSize();
	};
	
	this.reset = function(){
		this.layout.destroy();
		this.containerEl.empty();
		this.layout.init(this.containerEl, this.viewNames);
	};
};

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
