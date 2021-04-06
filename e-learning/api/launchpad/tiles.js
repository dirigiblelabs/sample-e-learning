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

var tiles = [];

var relativePath = getRelativePath(request.getParameter("pathSegments"));
var tileExtensions = extensions.getExtensions("launchpad-e-learning-tiles");
for (var i = 0; tileExtensions !== null && i < tileExtensions.length; i++) {
    var tileExtension = require(tileExtensions[i]);
    var tile = tileExtension.getTile(relativePath);
    var found = false;
    for (var j = 0 ; j < tiles.length ; j ++) {
    	if (tiles[j].group === tile.group) {
    		tiles[j].tiles.push(tile);
    		found = true;
    	}
    }
    if (!found) {
    	tiles.push({
    		"group": tile.group,
    		"tiles": [tile]
    	});
    }
}

tiles = tiles.sort(function(a, b) {
	var result = a.tiles[0].order - b.tiles[0].order;
	if (result === 0) {
		return a.group < b.group ? -1 : a.group > b.group ? 1 : 0;
	}
	return result;
});

response.println(JSON.stringify(tiles));

function getRelativePath(pathSegments) {
	var relativePath = "/";
	for (var i = 0; i < pathSegments; i ++) {
		relativePath += "../";
	}
	return relativePath;
}
