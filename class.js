// Class.js 1.4.0
// author Tangoboy
// http://www.cnblogs.com/tangoboy/archive/2010/08/03/1790412.html
// Dual licensed under the MIT or GPL Version 2 licenses.

(function(root, factory) {

  // Set up $Class appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(function() {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      return root.$Class = factory(root);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {

    factory(exports);

  // Finally, as a browser global.
  } else {
  	
    root.$Class = factory(root);
  }

}(this, function(host){

	//不能在严谨代码模式 'use strict';

	var opt = Object.prototype.toString,
	isStr = function(s){return opt.call(s)==="[object String]"},
	isFun = function(f){return opt.call(f)==="[object Function]"},
	isObj = function(o){return opt.call(o)==="[object Object]"},
	clone = function(o){
		var newO,
			noop = function(){};
		if (Object.create) {
			newO = Object.create(o);
		} else {
			noop.prototype = o;
			newO = new noop();
		}
		return newO;
	};

	function createPrototype(proto, constructor) {
		var newProto = clone(proto);
		newProto.constructor = constructor;
		return newProto;
	}

	function mix(r, s) {
		for (var i in s) {
			r[i] = s[i];
		}
		return r;
	}

	//无new实例化 构造函数包裹 使类同时支持 new A() 或 A() 实例化
	function wrapConstructor(constructor){
		return function(){
			var selfConstructor = arguments.callee;
			if(this instanceof selfConstructor){
				constructor.apply(this, arguments);
				return this;
			}else{
				return $Class['new'](selfConstructor, arguments);
			}
		};
	}


	var config = {
		autoSuperConstructor:false, //当子类被实例化时是否先执行父类构造函数 设置后仅对后面声明的类有效
		notUseNew:true,             //是否可以不使用new直接调用方法实例化对像 如：A()
		useExtend:true,             //是否使用让类拥有拓展继承的方法 如：B = A.$extend({})
		useSuper:true               //是否让类有$super属性访问父类成员 如：B.$super.foo()
	};



	var $Class = {
		/**
	     * 配置类.
	     *
	     * @param {String|Object|null} c 某个配置项名|设置配置项|空值
	     * @return {Mixed|Object|Object} 取出某个配置项|混合后的设置配置项|取出所有配置
	     * @doc
	     */
		config:function(c){
			if(isStr(c)){
				return config[c];
			}else if(isObj(c)){
				return config = mix(config, c);
			}
			return config;
		},
		/**
	     * 创建一个类  混合构造函数/原型方式.
	     *
	     * @param {Object} data 定义类成员的对象
	     * @return {Function(Class)} 返回创建的类
	     * @doc
	     */
		create: function(data) {
			return $Class.inherit($Class.Base, data);
		},
		/**
	     * 实例化类 可以替代 new 操作符
	     *
	     * @param {Function(Class)} cls 类
	     * @param {Array} [args] 参数
	     * @return {Object} 返回构建的实例
	     * @doc
	     */
		"new":function(cls, args){
			var instance = clone(cls.prototype);
			cls.apply(instance, args||[]);
			return instance;
		},
		/**
	     * 继承  混合对象冒充原型链方式.
	     *
	     * @param {Function(Class)} source 父类
	     * @param {Object} [extd] 定义类成员的对象
	     * @param {Boolean} [execsuperc] 默认false 当子类被实例化时是否先执行父类构造函数
	     * @return {Function(Class)} 返回创建的子类
	     * @doc
	     */
		inherit:function(source, extd, execsuperc) {
			if(!isFun(source))return;
			extd = extd || {};
			execsuperc = execsuperc||config.autoSuperConstructor;
			var obj = extd.__ || function(){};
			//过滤构造方法和原型方法
			delete extd.__;
			//对象冒充
			var constructor = function(){
				if(execsuperc){
					source.apply(this, arguments);
				}
				obj.apply(this, arguments);
			};

			if(config.notUseNew){
				//构造函数包裹 new A 和 A() 可以同时兼容
				constructor = wrapConstructor(constructor);
			}

			constructor.name = obj.name;
			constructor.length = obj.length;

			//维持原型链
			constructor.prototype = createPrototype(source.prototype, constructor);
			//原型扩展
			this.include(constructor, source.prototype);
			this.include(constructor, extd);

			//添加父类属性
			constructor.$super = createPrototype(source.prototype, source);

			if(config.useExtend){
				constructor.$extend = function(extd, execsuperc){
					return $Class.inherit(this, extd, execsuperc);
				};
			}

			return constructor;
		},
		/**
	     * 原型成员扩展.
	     *
	     * @param {Function(Class)} target 需要被原型拓展的类
	     * @param {Object} [ptys] 定义原型成员的对象
	     * @return {Function(Class)} 返回被拓展的类
	     * @doc
	     */
		include:function(target, ptys){
			if(!isFun(target)){target = function(){};}
			if(isObj(ptys)){
				mix(target.prototype, ptys);
			}
			return target;
		},
		/**
	     * 克隆对象.
	     *
	     * @param {Object} o 需要克隆的对象
	     * @return {Object} 返回克隆后的对象
	     * @doc
	     */
		clone:clone
	};


	//所有$Class.create的类Foo都继承自   Foo <= Base <= Object
	//因此你可以通过$Class.Base.prototype拓展所有类

	$Class.Base = $Class.inherit(Object);


	return host.$Class = $Class;
	

}));
