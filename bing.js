// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.462
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
var default_search_words = ["中法元首相会都江堰", "对日斗争突发新情况", "美最新报告：不允许任何国家过于强大", "国际机构看中国经济 关键词亮了", "男子欠近5000元房费 酒店倒贴都不搬", "荒野求生女选手疑遭骚扰 榕江通报", "净网：网民造谣汽车造成8杀被查处", "海军、国防部、外交部 严正批驳×3", "国乒8比1击败日本队 11战全胜夺冠", "千吨级“巨无霸”就位", "中国女游客度假时从酒店9楼坠亡", "美防长暗指日本搭便车将付出代价", "俄方：已准备好迎接无限数量印度技工", "央视曝光汽车智驾神器成夺命陷阱", "日本预测直下型地震或致1.8万人遇难", "长沙一男子要取现20万 银行紧急报警", "曝美国未支持高市谬论让日本慌了", "东营黄河口“鸟浪化鲲”太震撼", "罪犯被判死缓破口大骂被害人一家", "中方不接受日方所谓交涉 已当场驳回", "男子海洋馆内抽烟被白鲸喷水浇灭", "男子出门十几分钟家差点没了", "日军机滋扰辽宁舰训练 中方严正交涉", "价格差10倍 高价鸡蛋真的更有营养吗", "国乒击败日本后齐唱《义勇军进行曲》", "12306出新功能了", "家长称婴儿被褥印不雅英文单词", "母亲做肺癌手术 儿子陪护也查出肺癌", "冬天也能“中暑”？警惕冬季热射病", "9岁男孩花5块1竞拍成校长助理", "新疆沙漠水稻丰收了", "网红王某莎骗捐被警方查处", "泰柬交火升级 泰国启动大撤离", "没得流感的人还用打疫苗吗", "美国16岁少年遭警察近距离射杀", "正直播NBA：掘金vs黄蜂", "印度警察深夜“抛尸”逃避工作", "男子吃霸王餐扇民警耳光被拘留", "日本“碰瓷”还恶人先告状", "90人当选香港新一届立法会议员", "韩泰等国发力承接中国游客", "内塔尼亚胡拒绝退出政坛换取赦免", "郭正亮：日本在与那国岛部署导弹没用", "委武装部队宣布增招士兵5600名", "国产挖掘机零下40摄氏度一秒启动", "德外长开启访华行程", "郎平笑谈是否会重返执教", "大闸蟹为何会在欧美泛滥成灾", "全网寻找的用围巾擦地女乘客找到了", "讲述南京大屠杀真相活动在日本举行", "警惕间谍用快递“暗度陈仓”"]

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
