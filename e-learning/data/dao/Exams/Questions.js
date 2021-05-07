var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "EL_QUESTIONS",
	properties: [
		{
			name: "Id",
			column: "QUESTION_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Lesson",
			column: "QUESTION_LESSON",
			type: "INTEGER",
		}, {
			name: "Title",
			column: "QUESTION_TITLE",
			type: "VARCHAR",
		}, {
			name: "Content",
			column: "QUESTION_CONTENT",
			type: "VARCHAR",
		}, {
			name: "QuestionType",
			column: "QUESTION_QUESTION_TYPE",
			type: "INTEGER",
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
		table: "EL_QUESTIONS",
		key: {
			name: "Id",
			column: "QUESTION_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "EL_QUESTIONS",
		key: {
			name: "Id",
			column: "QUESTION_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "EL_QUESTIONS",
		key: {
			name: "Id",
			column: "QUESTION_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM EL_QUESTIONS");
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
	producer.queue("e-learning/Exams/Questions/" + operation).send(JSON.stringify(data));
}