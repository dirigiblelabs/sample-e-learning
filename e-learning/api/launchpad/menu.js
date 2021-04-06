/*
 * Copyright (c) 2010-2020 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 * Contributors:
 * SAP - initial API and implementation
 */

var extensions = require("core/v4/extensions");
var request = require("http/v4/request");
var response = require("http/v4/response");

var extensionPoint = request.getParameter("extensionPoint");
var mainmenu = [];

var menuExtensions = extensions.getExtensions(extensionPoint);
for (var i = 0; menuExtensions !== null && i < menuExtensions.length; i++) {
    var menuExtension = require(menuExtensions[i]);
    var menu = menuExtension.getMenu();
    mainmenu.push(menu);
}

mainmenu.sort(function(p, n) {
	return parseInt(p.order, 0) - parseInt(n.order, 0);
});

response.println(JSON.stringify(mainmenu));
