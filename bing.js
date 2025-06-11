// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.102
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
var default_search_words = ["推动不同文明交流对话、和谐共生", "1.6亿粉丝网红面瘫哥在美被捕", "韩乔生：国足在狼藉中翻出一粒金子", "古今碰撞 绘出网络文明“新画卷”", "李成钢：中美原则上达成协议框架", "女生高考完独自挑一扁担行李回家", "特朗普：洛杉矶骚乱是“外国入侵”", "黄圣依程潇谈是否接受婚前同居", "205斤小伙被大风吹倒 头部着地滚翻", "聚焦就业教育等民生保障最关键问题", "肖战霸榜沸点人物 热巴新晋登榜", "高考生在爆燃事故中遇难？不实", "爸爸的朋友不知道他去世 提排骨找他", "女子称丈夫因离婚纠纷毒死2亲生儿女", "双胞胎考场外跪谢爷爷", "男童吃毒蘑菇去世 曾说爸爸别担心我", "美国抗议者占领特朗普大厦", "击败国足后 印尼被日本6-0吊打", "700名美海军陆战队士兵已抵达洛杉矶", "井柏然晒素颜照自称“中年男子”", "中国双航母首次同时现身西太", "教育部：今年“双一流”高校本科扩招", "俄军动用315架无人机及7枚导弹", "洛杉矶警方承认局面已失控", "全国夏粮小麦收获进度过七成", "两中国军舰同时现太平洋 外交部回应", "吉利汽车集团承诺账期统一为60天内", "男子吃见手青中毒一直帮凤凰捋毛", "深圳一写字楼浓烟滚滚系消防演习", "美法官驳回加州阻止派兵的请求", "铸造铝合金期货及期权上市", "伊万谈国足备战7月东亚杯", "看病用电梯需付费5元 医院回应", "阿根廷维持对前总统欺诈罪判决", "欧盟公布第十八轮对俄制裁措施草案", "王大雷赛后发文致谢所有人", "范志毅说一定要保护好王钰栋", "法国一中学发生学生持刀伤人事件", "中国双航母出击 历史会记住这一幕", "《长安的荔枝》口碑出圈成黑马喜剧", "美商务长称中美谈判进展顺利", "徐志胜叫汪峰峰子", "年轻人为何选择简办婚礼", "美抗议者盯上自动驾驶网约车", "徐州队领队：苏超爆火是因真诚", "隐瞒不报境外房产 隋军被“双开”", "美以官员：特朗普反对军事打击伊朗", "第23周汽车销量排行公布", "递表踊跃 港股机器人“军团”扩编", "那尔那茜本科毕业后留学3年", "多只氢能概念股获基金重仓"]

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
