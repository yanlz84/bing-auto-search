// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.221
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平在浙江的文化故事", "事关存钱取钱！超5万元或将全面尽调", "女明星都躲不过的病 盯上了这群女孩", "数说以旧换新“多重效应”", "百果园董事长谈水果贵：教消费者成熟", "30名僧人集体辞职？少林寺发声明回应", "老外高铁坐过站被误会 吃惊表情走红", "净网：钟某造谣“海啸袭上海”被拘", "全红婵分享训练照：练瘦了", "马斯克：日本今年将会失去近100万人", "中公教育17000元退款需17年退完", "儿科专家余波突发疾病逝世 年仅50岁", "男子中1000万 看到寻人启事才发现", "宠物狗未拴绳被碾 主人失控捶打司机", "女子在东京大学烟囱坠亡 友人发声", "董璇张维伊晒照官宣", "陈楚生断层拿下“歌王”却饱受争议", "赵露思：要是去跑滴滴也会很拼", "中国男子在美移民拘留中心上吊身亡", "甘肃榆中灾民：洪水从山体倾泻而下", "家信召弟从军！抗战是伟大的母亲", "曝一医院禁止规培生进职工餐厅吃饭", "三一集团：许愿有天请赵露思开挖掘机", "甘肃榆中山洪已致15人遇难", "未来打飞的可能和出租车一个价", "女子回家发现1米长眼镜蛇跳窗逃生", "男子修行后还俗 向女儿要20万赡养费", "孙颖莎3-1桥本帆乃香 晋级8强", "双腿截肢女子夜市摆摊成“团宠”", "小男孩被水冲走 外国女子跳水救人", "中国留学生在澳遭围殴视频曝光", "幼儿园招生进入白热化", "日本网友被科普日本侵华历史大破防", "成都串串店老板搬冰块给顾客降温", "婚内强奸案将开庭 律师称做无罪辩护", "车主开车时被飞来石头砸穿玻璃毁容", "韩媒模拟尹锡悦拒捕：10个人都没架走", "山姆最忠实的学徒不开会员店了", "“男美人鱼”走红：暑期月薪近万元", "与砒霜同级的致癌物有1亿国人在嚼", "澳洲发生多起袭击中国公民事件", "男子登报向女友道歉：原谅我不够体贴", "中国男子抵达柬埔寨后身亡 监控曝光", "美国纽约时报广场发生枪击事件", "黄仁勋儿女已成英伟达新兴业务干将", "日本男女家中藏尸 与尸体同住15个月", "女孩落入深水区 的哥飞奔跳水救人", "女儿被抵制出道 黄奕怼网友：你上", "乌军一架苏-27战机被击落", "特朗普普京将会晤 泽连斯基可能参会", "宇树王兴兴：把公司上市当作“高考”"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
