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

var perspectives = [];

var relativePath = getRelativePath(request.getParameter("pathSegments"));
var perspectiveExtensions = extensions.getExtensions("launchpad-e-learning-perspective");
for (var i = 0; perspectiveExtensions !== null && i < perspectiveExtensions.length; i++) {
    var perspectiveExtension = require(perspectiveExtensions[i]);
    var perspective = perspectiveExtension.getPerspective(relativePath);
    if (!isPerspectiveAdded(perspectives, perspective)) {
	perspectives.push(perspective);
    }
}

perspectives.sort(function(p, n) {
	return parseInt(p.order, 0) - parseInt(n.order, 0);
});

response.println(JSON.stringify(perspectives));

function isPerspectiveAdded(perspectives, perspective) {
	for (var i = 0; i < perspectives.length; i ++) {
		if (perspectives[i].name === perspective.name) {
			return true;
		}
	}
	return false;
}

function getRelativePath(pathSegments) {
	var relativePath = "/";
	for (var i = 0; i < pathSegments; i ++) {
		relativePath += "../";
	}
	return relativePath;
}
