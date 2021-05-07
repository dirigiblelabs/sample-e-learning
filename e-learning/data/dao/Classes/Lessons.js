var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "EL_LESSONS",
	properties: [
		{
			name: "Id",
			column: "LESSON_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Class",
			column: "LESSON_CLASS",
			type: "INTEGER",
		}, {
			name: "Title",
			column: "LESSON_TITLE",
			type: "VARCHAR",
		}, {
			name: "Content",
			column: "LESSON_CONTENT",
			type: "VARCHAR",
		}]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "EL_LESSONS",
		key: {
			name: "Id",
			column: "LESSON_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "EL_LESSONS",
		key: {
			name: "Id",
			column: "LESSON_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "EL_LESSONS",
		key: {
			name: "Id",
			column: "LESSON_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM EL_LESSONS");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("e-learning/Classes/Lessons/" + operation).send(JSON.stringify(data));
}