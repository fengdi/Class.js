// Class.js 1.4.2
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

	var uuid = 0,
	opt = Object.prototype.toString,
	isStr = function(s){return opt.call(s)==="[object String]"},
	isFun = function(f){return opt.call(f)==="[object Function]"},
	isObj = function(o){return opt.call(o)==="[object Object]"},
	isSupport__proto__ = ({}).__proto__ == Object.prototype,//检验__proto__特性
	clone = function(obj){
		var newObj,
			noop = function(){};
		if (Object.create) {
			newObj = Object.create(obj);
		} else {
			noop.prototype = obj;
			newObj = new noop();
		}
		return newObj;
	};
	//创建一个原型对象，创建的是一次克隆
	function createPrototype(proto, constructor) {
		var newProto = clone(proto);
		newProto.constructor = constructor;
		return newProto;
	}
	//混杂
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
				var re = constructor.apply(this, arguments);
				return isObj(re)?re:this;
			}else{
				return $Class['new'](selfConstructor, arguments);
			}
		};
	}


	var config = {
		autoSuperConstructor:false, //当子类被实例化时是否先执行父类构造函数 设置后仅对后面声明的类有效
		notUseNew:true,             //是否可以不使用关键字new 直接调用方法实例化对象 如：A()
		useExtend:true,             //是否使用让类拥有拓展继承的方法 如：B = A.$extend({})
		useSuper:true,              //是否让类有$super属性访问父类成员 如：B.$super.foo()
		disguise:false,             //是否让代码生成的构造函数伪装成定义的__:function(){}
		useConstructor:true         //是否使用B.$constructor来保存定义的__构造函数，这里create inherit生成的构造函数是不等于__的
	};


	var $Class = {
		Base:null,//作用见后面赋值

		/**
		 * 配置方法 对某些功能设置是否开启.  配置说明见config定义
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
			return $Class.inherit($Class.Base||Object, data);
		},
		/**
		 * 实例化类 可以替代 new 操作符
		 *
		 * @param {Function(Class)} clas 类
		 * @param {Array} [args] 参数
		 * @return {Object} 返回构建的实例
		 * @doc
		 */
		"new":function(clas, args){
			if(isFun(clas)){
				var instance = clone(clas.prototype);
				var re = clas.apply(instance, args||[]);
				return isObj(re) ? re : instance;
			}else{
				throw new Error('fatal error: $Class.new expects a constructor of class.');  
			}
		},
		/**
		 * 继承  混合对象冒充原型链方式.
		 *       目前只对构造函数上加上某些属性（如：$super，$constructor，$extend）
		 *       但类的实例是没有任何污染的
		 *
		 * @param {Function(Class)} source 父类
		 * @param {Object} [extend] 定义类成员的对象
		 * @param {Boolean} [autoSuperConstructor] 默认false 当子类被实例化时是否先执行父类构造函数
		 * @return {Function(Class)} 返回创建的子类
		 * @doc
		 *
		 * 差异：
		 *		1.返回类 !== extend.__
		 *		2.不支持__proto__的浏览器下 for in 遍历实例会遍历出constructor
		 */
		inherit:function(source, extend, autoSuperConstructor) {
			if(!isFun(source))return;
			extend = extend || {};
			autoSuperConstructor = autoSuperConstructor||config.autoSuperConstructor;
			var defineConstructor = extend.__ || function(){};
			//过滤构造方法和原型方法
			delete extend.__;
			//对象冒充
			var constructor = function(){
				if(autoSuperConstructor){
					source.apply(this, arguments);
				}
				var re = defineConstructor.apply(this, arguments);
				if(isObj(re))return re;
			};

			if(config.notUseNew){
				//构造函数包裹 new A 和 A() 可以同时兼容
				constructor = wrapConstructor(constructor);
			}
			if(config.disguise){
				constructor.name = defineConstructor.name;
				constructor.length = defineConstructor.length;
				constructor.toString = function(){return defineConstructor.toString()};//屏蔽了构造函数的实现
			}
			//维持原型链 把父类原型赋值到给构造器原型，维持原型链
			if(isSupport__proto__){ 
				constructor.prototype.__proto__ = source.prototype;
			}else{
				constructor.prototype = createPrototype(source.prototype, constructor);
			}
			//原型扩展 把最后配置的成员加入到原型上
			this.include(constructor, extend);

			if(config.useSuper){
				//添加父类属性
				constructor.$super = createPrototype(source.prototype, source);
			}

			if(config.useSuper){
				//添加定义的构造函数
				constructor.$constructor = defineConstructor;
			}

			if(config.useExtend){
				constructor.$extend = function(extend, execsuperc){
					return $Class.inherit(this, extend, execsuperc);
				};
			}

			return constructor;
		},
		/**
		 * 原型成员扩展.
		 *
		 * @param {Function(Class)} target 需要被原型拓展的类
		 * @param {Object} [protos] 定义原型成员的对象
		 * @return {Function(Class)} 返回被拓展的类
		 * @doc
		 */
		include:function(target, protos){
			if(!isFun(target)){target = function(){};}
			if(isObj(protos)){
				mix(target.prototype, protos);
			}
			return target;
		},
		/**
		 * 创建一个单例类   无论怎么实例化只有一个实例存在
		 *       此单例类与常用{}作为单例的区别：
		 *       有前者是标准function类，需要实例化，可以拓展原型，可以继承
		 *
		 * @param {Object} obj 定义单例类成员的对象 
		 * @return {Object} singletonClass 单例类
		 * @doc
		 */
		singleton:function(obj){
			var singletonClass;
			return singletonClass = $Class.create(mix(obj||{}, {
				__:function(){
					if(singletonClass.$instance instanceof singletonClass){
						return singletonClass.$instance;
					}else{
						return singletonClass.$instance = this;
					}
				}
			}));
		},
		/**
		 * 克隆对象.
		 *
		 * @param {Object} o 需要克隆的对象
		 * @return {Object} 返回克隆后的对象
		 * @doc
		 */
		clone:clone,
		/**
		 * 获取某个类的成员 会从原型链上遍历获取.
		 *
		 * @param {Object} clas 类
		 * @return {Array} 返回该类整个原型链上的成员
		 * @doc
		 */
		member:function(clas){
			if(!isFun(clas))return;
			var member = [];
			var m = {constructor:1};
			for (var chain = clas.prototype; chain && chain.constructor; chain = chain.constructor.prototype){
				for(var k in chain){
					m[k] = 1;
				}
				if(chain.constructor==clas || chain.constructor==Object){
					//链为循环 或者 链到达Object 结束
					//不在Object原型上去循环了Object.prototype.constructor == Object
					break;
				}
			};
			for(var i in m){
				member.push(i);
			}
			return member;
		},
		/**
		 * 混杂
		 *
		 * @param {Object} r 被混杂的Object
		 * @param {Object} s 参入的Object
		 * @return {Object} r 被混杂的Object
		 * @doc
		 */
		mix:mix
	};

	// Base
	// 所有$Class.create的类Foo都继承自$Class.Base     Foo <= Base <= Object
	// 因此你可以通过$Class.Base.prototype拓展所有create出来的类
	// 你也可以删除$Class.Base 或者 $Class.Base = null 这样就可以改变继承为 Foo <= Object
	$Class.Base = $Class.inherit(Object);


	return host.$Class = $Class;
	

}));
