/*
 * Copyright (c) 2010-2021 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 * Contributors:
 * SAP - initial API and implementation
 */

var dao = require("e-learning/data/dao/Classes/Classes.js")

exports.getTile = function(relativePath) {
	let count = "n/a";
	try {
		count = dao.customDataCount();	
	} catch (e) {
		console.error("Error occured while involking 'e-learning/data/dao/Classes/Classes.customDataCount()': " + e);
	}
	return {
		name: "Classes",
		group: "Classes",
		icon: "file-o",
		location: relativePath + "services/v4/web/e-learning/ui/Classes/index.html",
		count: count,
		order: "100"
	};
};
