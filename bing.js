// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.77
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
var default_search_words = ["推动少先队事业不断取得新成绩", "国防部回应歼-10CE击落多架战机", "打虎！正部级毕井泉被查", "端午将至 “龙舟狂欢模式”开启", "中方回应印度疑获得未爆炸中国导弹", "央视主持人朱迅在景区救人", "广东多地拍到耀眼发光体 专家回应", "卤鹅哥称很快会去美国见甲亢哥", "《情深深雨濛濛》一大家子都挺忙", "莫名收到20多条验证码隔天6万没了", "“亚洲最大医院”原院长阚全程被查", "女子向丈夫要5元遭拒轻生？假", "榴莲价格暴跌50% 有人买了50箱", "演员孙菲菲回应整容失败", "女子因脱发30岁被误认为奶奶", "校长毕业典礼摆500桌宴席给学生送行", "曹德旺：福耀科大8亿预算招50个学生", "中国小朋友不能再胖了", "贵州58岁产妇顺利产下一名男婴", "话剧演员转行做猫砂一年卖7个亿", "南方划龙舟指哪划哪 北方是划哪算哪", "李子柒手制植物印染长裙出圈", "中方回应特朗普关税政策被叫停", "国防部回应美称中方全方位演练收台", "第一批去寺庙减脂的人胖了11斤", "女子吃30只飞蚂蚁后蛋白超标腹痛", "韩国一客机冲出跑道 载183名乘客", "男老师上阵给学生化妆一分钟化十个", "坐飞机儿童票比成人票还贵合理吗", "夫妻为二胎儿子跟谁姓离婚", "#马斯克离职后会成为替罪羊吗#", "残疾企业家考第一名仍被拒绝入学", "iPhone17ProMax最新机模曝光", "宇树科技公司变更新名称", "美法院叫停 特朗普关税战凉了吗", "巴勒斯坦代表悲愤捶桌泪洒安理会", "台检方追查“死亡连署”案", "英国黄牛为抢Labubu大打出手", "负责人回应中国寻亲网关闭服务器", "端午假期天气如何？气象局解答", "iPhone标准版重回全球畅销榜第一", "美媒：美暂停对华出口部分关键技术", "经济第一大省 渴望下一个“爆款”", "国防部正告台当局：“台独”没好下场", "一级巡视员搞迷信活动被开除党籍", "马斯克官宣即将离开特朗普政府", "美国大满贯孙颖莎王曼昱搭档女双", "《在人间》高概念叙事挑战创作边界", "二胎爸爸工作和带娃崩溃患产后抑郁", "亚历山大的老爸把玩西决MVP奖杯", "公园“司马光砸缸”雕塑被吐槽像猴"]

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
