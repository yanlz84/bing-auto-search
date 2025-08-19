// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.241
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
var default_search_words = ["不灭的“灯塔” 不屈的脊梁", "“全国最矮的山”火了", "新东方CEO被立案？东方甄选：已报警", "高温持续温差拉大 这五件事不宜做", "3男子欲将醉酒女生抬上车 路人出手", "倪妮背了个“人”走红毯", "净网：中医堂？违规广告？侵公犯罪？", "男子潜入陌生人家中 麻醉女子并抽血", "邓超模仿吴艳妮招牌动作", "日本冲绳海港出现凶猛鱼类面目狰狞", "副教授遭精神病人杀害 儿子一夜秃头", "山西忻州有车辆失联致10死2伤？假", "北京暴雨过后出现“双彩虹”", "体育总局局长：重拳整治足球发展乱象", "醉驾送早产妻子就医被判无罪", "1岁男孩失踪6天 孩子父亲去年去世", "俩小孩高铁上静音打架只动手不动嘴", "个人养老金新增3种领取情形", "中国佛教协会再谈释永信被查", "98岁老兵分享长寿秘诀：睡觉是关键", "北方的雨为啥总耽误下班？专家解读", "李想落泪感谢美团王兴", "假冒军人、院士 阮少平已被刑拘", "阳光玫瑰跌到9.9元一斤 消费者嫌贵", "59岁李若彤分享保养心得", "泽连斯基松口：停火不再是谈判条件", "凌晨三点那些在互联网上看病的人", "“身首离断”患者已能在辅助下坐起", "网友建议高铁设带娃车厢 12306回应", "迪丽热巴红毯造型遭调侃像铜人", "澳门六旬男子杀弟后跳楼坠亡", "女子被误诊绝症服药3月 卫健委介入", "女中医调休6天抽空打场UFC", "医生40秒教你看懂血常规化验单", "20岁女生留学第9天自杀  疑曾遭电诈", "#北京七下八上的暴雨又来了#", "梁靖崑爆冷止步欧洲大满贯32强", "41岁刘秋德因公殉职", "求职者进厂面试 中介叮嘱别说是本科", "“重庆棒棒父子”儿子考上专科", "中俄领导人是否会通话？外交部回应", "58岁渔民被海鲜刺伤身亡", "游客吃剩2份炒饭被商家端回并盘", "游客吐槽大唐不夜城“拍照陷阱”", "雷军发布小米集团二季度财报", "于正谈和林心如闹掰：当时年轻小气", "乌提议欧购千亿军火换美对乌保障", "女子举报中科院研究所员工婚内出轨", "泡泡玛特：上半年营收同比增长204.4%", "西安将全面暂停网约车一口价、特惠单", "钉钉被曝CEO凌晨巡查工位"]

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
