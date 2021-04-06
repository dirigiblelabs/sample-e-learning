/*
 * Copyright (c) 2010-2020 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 * Contributors:
 * SAP - initial API and implementation
 */

function getPathSegments() {
	var path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'))
	var pathSegments = path.substr(path.indexOf('services/')).split('/').length;
	return pathSegments;
}

function getRelativePath(pathSegments) {
	var relativePath = '';
	for (var i = 0; i < pathSegments; i ++) {
		relativePath += '../';
	}
	return relativePath;
}

var pathSegments = getPathSegments()
var relativePath = getRelativePath(pathSegments);

/**
 * Provides key microservices for constructing and managing the IDE UI
 *
 */
angular.module('ideUiCore', ['ngResource'])
.provider('messageHub', function MessageHubProvider() {
  this.evtNamePrefix = '';
  this.evtNameDelimiter = '.';
  this.$get = [function messageHubFactory() {
    var messageHub = new FramesMessageHub();
	//normalize prefix if any
	this.evtNamePrefix = this.evtNamePrefix || '';
	this.evtNamePrefix = this.evtNamePrefix ? (this.evtNamePrefix+this.evtNameDelimiter): this.evtNamePrefix;
	var send = function(evtName, data, absolute){
		if(!evtName)
			throw Error('evtname argument must be a valid string, identifying an existing event');
		messageHub.post({data: data}, (absolute ? '' : this.evtNamePrefix) + evtName);
	}.bind(this);
	var on = function(evtName, callbackFunc){
		if(typeof callbackFunc !== 'function')
			throw Error('Callback argument must be a function');
		messageHub.subscribe(callbackFunc, evtName);
	};
	return {
		send: send,
		on: on
	};
  }];
})
.factory('Theme', ['$resource', function($resource){
	var themeswitcher = $resource(relativePath + 'services/v4/core/theme?name=:themeName', {themeName: 'default'});
	var themes = {
		"default": relativePath + "services/v4/web/resources/themes/default/bootstrap.min.css",
		"wendy" : relativePath + "services/v4/web/resources/themes/wendy/bootstrap.min.css",
		"baroness" : relativePath + "services/v4/web/resources/themes/baroness/bootstrap.min.css",
		"simone" : relativePath + "services/v4/web/resources/themes/simone/bootstrap.min.css"
	};
	return {
		changeTheme: function(themeName){
			return themeswitcher.get({'themeName':themeName});
		},
		themeUrl: function(themeName){
			return themes[themeName];
		},
		reload: function(){
			location.reload();
		}
	}
}])
.service('Perspectives', ['$resource', function($resource){
	return $resource(relativePath + 'services/v4/js/e-learning/api/launchpad/perspectives.js');
}])
.service('Tiles', ['$resource', function($resource){
	return $resource(relativePath + 'services/v4/js/e-learning/api/launchpad/tiles.js');
}])
.service('Menu', ['$resource', function($resource){
	return $resource(relativePath + 'services/v4/js/e-learning/api/launchpad/menu.js');
}])
.service('User', ['$http', function($http){
	return {
		get: function(){
			var user = {};
			$http({
				url: relativePath + 'services/v4/js/ide-core/services/user-name.js',
				method: 'GET'
			}).success(function(data){
				user.name = data;
			});
			return user;
		}
	};
}])
/**
 * Creates a map object associating a view factory function with a name (id)
 */
.provider('ViewFactories', function(){
	var self = this;
	this.factories = {
			"frame": function(container, componentState){
				container.setTitle(componentState.label || 'View');
					$('<iframe>').attr('src', componentState.path).appendTo(container.getElement().empty());
			}
	};
	this.$get = [function viewFactoriesFactory() {
		return this.factories;
	}];
})
/**
 * Wrap the ViewRegistry class in an angular service object for dependency injection
 */
.service('ViewRegistrySvc', ViewRegistry)
/**
 * A view registry instance factory, using remote service for intializing the view definitions
 */
.factory('viewRegistry', ['ViewRegistrySvc', '$resource', 'ViewFactories', function(ViewRegistrySvc, $resource, ViewFactories){
	Object.keys(ViewFactories).forEach(function(factoryName){
		ViewRegistrySvc.factory(factoryName, ViewFactories[factoryName]);
	});		
	var get = function(viewsExtensionPoint){
		return $resource(relativePath + 'services/v4/js/e-learning/api/launchpad/views.js')
			.query({
				'extensionPoint': viewsExtensionPoint,
				'pathSegments': pathSegments
			}).$promise
				.then(function(data){
					data = data.map(function(v){
						v.id = v.id || v.name.toLowerCase();
						v.label = v.label || v.name;
						v.factory = v.factory || 'frame';
						v.settings = {
							"path": v.link
						}
						v.region = v.region || 'left-top';
						return v;
					});
					//register views
					data.forEach(function(viewDef){
						ViewRegistrySvc.view(viewDef.id, viewDef.factory, viewDef.region, viewDef.label,  viewDef.settings);
					});
					return ViewRegistrySvc;
				});
	};
	
	return {
		get: get
	};
}])
.factory('Layouts', [function(){
	return {
		manager: undefined
	};
}])
.directive('menu', ['$resource', 'Theme', 'User', 'Layouts', 'Menu', 'messageHub', function($resource, Theme, User, Layouts, Menu, messageHub){
	return {
		restrict: 'AE',
		transclude: true,
		replace: 'true',
		scope: {
			menuExtensionPoint: '@menuExtensionPoint',
			menu:  '=menuData'
		},
		link: function(scope, el, attrs){
			function loadMenu(){
				scope.menu = Menu.query({'extensionPoint': scope.menuExtensionPoint});
			}
			if(!scope.menu && scope.menuExtensionPoint)
				loadMenu.call(scope);
			scope.menuClick = function(item) {
				Layouts.manager.openView(item.id);
			};
			scope.selectTheme = function(themeName){
				Theme.changeTheme(themeName);
				var themeUrl = Theme.themeUrl(themeName);
				setTimeout(function(){
					Theme.reload();
				}, 2000);
			};
			scope.resetTheme = function() {
				localStorage.clear();
				Theme.reload();
			};
			scope.logout = function() {
				window.location.href = relativePath + 'logout';
			};
			scope.user = User.get();
		},
		templateUrl: relativePath + 'services/v4/web/e-learning/ui/resources/templates/menu.html'
	}
}])
.directive('sidebar', ['Perspectives', function(Perspectives){
	return {
		restrict: 'AE',
		transclude: true,
		replace: 'true',
		scope: {
			active: '@'
		},
		link: function(scope, el, attrs){
			scope.perspectives = Perspectives.query({'pathSegments': pathSegments});
			scope.activePerspective = localStorage.getItem('DIRIGIBLE.application.e-learning.activePerspective');

			scope.setActivePerspective = function(activePerspective) {
				localStorage.setItem('DIRIGIBLE.application.e-learning.activePerspective', activePerspective);
				scope.activePerspective = activePerspective;
			};
		},
		templateUrl: relativePath + 'services/v4/web/e-learning/ui/resources/templates/sidebar.html'
	}
}])
.directive('tiles', ['Tiles', function(Tiles){
	return {
		restrict: 'AE',
		transclude: true,
		replace: 'true',
		scope: {
			active: '@'
		},
		link: function(scope, el, attrs){
			scope.tiles= Tiles.query({'pathSegments': pathSegments});

			scope.setActiveView = function(activeView) {
				localStorage.setItem('DIRIGIBLE.application.e-learning.activePerspective', activeView.group);
				localStorage.setItem('DIRIGIBLE.application.e-learning.focusView', activeView.name);
			};
		},
		templateUrl: relativePath + 'services/v4/web/e-learning/ui/resources/templates/tiles.html'
	}
}])
.directive('statusBar', ['messageHub', function(messageHub){
	return {
		restrict: 'AE',
		scope: {
			statusBarTopic: '@'
		},
		link: function(scope, el, attrs){
			messageHub.on(scope.statusBarTopic || 'status.message', function(msg){
				scope.message = msg.data;
			});
		}
	}
}])
.directive('viewsLayout', ['viewRegistry', 'Layouts', function(viewRegistry, Layouts){
	return {
		restrict: 'AE',
		scope: {
			viewsLayoutModel: '=',
			viewsExtensionPoint: '@viewsExtensionPoint'
		},
		link: function(scope, el, attrs){
			var views;
			if(scope.layoutViews){
				views = scope.layoutViews.split(',');
			} else {
				views =  scope.viewsLayoutModel.views;
			}
			var eventHandlers = scope.viewsLayoutModel.events;
			
			viewRegistry.get(scope.viewsExtensionPoint).then(function(registry){
				scope.layoutManager = new LayoutController(registry);
				if(eventHandlers){
					Object.keys(eventHandlers).forEach(function(evtName){
						var handler = eventHandlers[evtName];
						if(typeof handler === 'function')
							scope.layoutManager.addListener(evtName, handler);
					});
				}
				$(window).resize(function(){scope.layoutManager.layout.updateSize()});
				scope.layoutManager.init(el, views);
				Layouts.manager = scope.layoutManager;
			});
		}
	}
}])	;
