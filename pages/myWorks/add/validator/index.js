export default {
	"title": {
	  "rules": [
	    {
	      "required": true,
		  "errorMessage": "标题不可为空"
	    },
	    {
	      "format": "string"
	    },
		{
			"minLength": 5,
			"maxLength": 100,
			"errorMessage": "标题长度在 5 到 100 个字符"
		}
	  ]
	},
	"content": {
		"rules": [
		  {
		    "required": true,
			"errorMessage": "内容不可为空"
		  },
		  {
		    "format": "string"
		  },
		]
	},
	"category_id": {
		"rules": [
			{
			  "required": true,
						"errorMessage": "分类不可为空"
			},
			{
				"format": "string"
			}
		]
	},
	"excerpt": {
		"rules": [
			{
				"format": "string"
			},
			{
				"maxLength": 300,
				"errorMessage": "长度在 300 个字符以内"
			}
		]
	},
	"avatarObj": {
		"rules": [
			{
				"format": "file"
			}
		]
	}
}
