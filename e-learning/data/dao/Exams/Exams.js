var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("e-learning/data/utils/EntityUtils");

var dao = daoApi.create({
	table: "EL_EXAMS",
	properties: [
		{
			name: "Id",
			column: "EXAM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Class",
			column: "EXAM_CLASS",
			type: "INTEGER",
		}, {
			name: "StartDate",
			column: "EXAM_START_DATE",
			type: "DATE",
		}, {
			name: "EndDate",
			column: "EXAM_END_DATE",
			type: "DATE",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "StartDate");
		EntityUtils.setLocalDate(e, "EndDate");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "StartDate");
	EntityUtils.setLocalDate(entity, "EndDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "StartDate");
	EntityUtils.setLocalDate(entity, "EndDate");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "EL_EXAMS",
		key: {
			name: "Id",
			column: "EXAM_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "StartDate");
	EntityUtils.setLocalDate(entity, "EndDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "EL_EXAMS",
		key: {
			name: "Id",
			column: "EXAM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "EL_EXAMS",
		key: {
			name: "Id",
			column: "EXAM_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM EL_EXAMS");
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
	producer.queue("e-learning/Exams/Exams/" + operation).send(JSON.stringify(data));
}