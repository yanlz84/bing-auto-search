// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.290
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
var default_search_words = ["山河永念 英雄归乡", "柯克案枪手落网：遭父亲“举报”", "以暴易暴成“毛骨悚然的美国仪式”", "过水门！最高礼遇迎接志愿军烈士", "神秘金主出手 威马汽车“复活”", "学校百名师生腹痛呕吐就医 官方通报", "女子遭陌生男子摸头 南昌警方通报", "金正恩：军队战斗力“空前加强”", "女子吃顿饭停车费300元 酒店回应", "海底捞小便事件涉案者父母判赔220万", "北约宣布部署“东方哨兵”", "河南南阳辟谣“法院警车接亲”", "王春宁等4名将领被罢免人大代表", "东部战区回应美英军舰过航台湾海峡", "iPhone 17系列预购 橙色最抢手", "浙江老板花3000元挽回约800万损失", "网友地铁偶遇外国游客干嚼火锅底料", "伊朗外长：核材料被埋废墟下", "克宫：俄乌谈判已“暂停”", "月嫂喂奶致新生儿窒息 月子中心回应", "《天龙八部》乔峰配音演员黄河去世", "法德英紧急发表联合声明", "中国驻韩使馆向殉职韩国海警致哀悼", "韩国海警救中国老人殉职 李在明发声", "“中国火箭”授牌首个“火箭班”", "南京一大桥玻璃墙频现撞鸟事件", "曹德旺现身福耀科技大学开学典礼", "卡塔尔驻华大使馆发文感谢中国", "妻子微信群辱骂丈夫被判在群中道歉", "《原神》新版上线即遭投诉", "联大通过决议批准《纽约宣言》", "查理·柯克不是马丁·路德·金", "iPhone17开启预售 苹果官网崩了", "美媒：冯德莱恩再次面临不信任投票", "已落网的柯克案嫌疑人是谁", "柯克枪击案嫌犯父亲是警官", "中部跨境电商大省再出手", "江西一面包车和半挂车相撞致5人死亡", "霍震霆：发展象棋深圳是很好的地方", "商丘一学校校长被罢免人大代表职务", "特朗普称将向孟菲斯派遣国民警卫队", "中美双方将在西班牙举行会谈", "优刻得两创始人套现引“离场”猜测", "河南队2比0北京国安", "巴西前总统律师团称将提出上诉", "俄媒：特朗普给中东盟友上了一课", "债市延续震荡格局 投资者应保持定力", "湖南一公司发生火灾 致3死2伤", "欧盟拟用迄今最强硬措施制裁以色列", "上海申花3比3山东泰山", "长春高空抛物致死案民事部分开庭"]

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
