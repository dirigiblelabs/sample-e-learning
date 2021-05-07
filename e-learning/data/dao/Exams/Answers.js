var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("e-learning/data/utils/EntityUtils");

var dao = daoApi.create({
	table: "EL_ANSWERS",
	properties: [
		{
			name: "Id",
			column: "ANSWER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Question",
			column: "ANSWER_QUESTION",
			type: "INTEGER",
		}, {
			name: "UserId",
			column: "ANSWER_USER_ID",
			type: "VARCHAR",
		}, {
			name: "Value",
			column: "ANSWER_VALUE",
			type: "VARCHAR",
		}, {
			name: "Exam",
			column: "EXAM",
			type: "INTEGER",
		}, {
			name: "IsCorrect",
			column: "ISCORRECT",
			type: "BOOLEAN",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "IsCorrect");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setBoolean(entity, "IsCorrect");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "IsCorrect");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "EL_ANSWERS",
		key: {
			name: "Id",
			column: "ANSWER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "IsCorrect");
	dao.update(entity);
	triggerEvent("Update", {
		table: "EL_ANSWERS",
		key: {
			name: "Id",
			column: "ANSWER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "EL_ANSWERS",
		key: {
			name: "Id",
			column: "ANSWER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM EL_ANSWERS");
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
	producer.queue("e-learning/Exams/Answers/" + operation).send(JSON.stringify(data));
}