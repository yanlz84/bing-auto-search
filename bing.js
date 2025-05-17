// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.52
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
var default_search_words = ["团结就是力量 合作才能共赢", "美国返还流失近80年的中国国宝", "女演员戴230万耳环引质疑 官方介入", "消费“挖潜” 发展“提速”", "美国加州50多只鸟空中突然爆炸", "男子质疑妻子两个孩子1天100不够吗", "新冠感染又抬头？专家回应", "俞灏明王晓晨结婚", "高铁启动女乘客突然冲出被门夹住", "女医生称副业收废品挣得比医院多", "28岁准新郎食物中毒去世", "福建屏南翻船致6人失踪？假", "湖南一乘客冲出高铁被车门夹住", "京津冀局地11级雷暴大风或大冰雹", "10亿违建豪宅被责令拆除 当地通报", "38岁女工靠扛楼还债50多万", "女星父亲：百万耳环非正品 我没贪污", "警方通报南宁一学校发生伤害案件", "男子吃饭狼吞虎咽把食管吃破了", "陈楚生唱《将进酒》仿佛在跟李白对话", "马筱梅婚礼前夜入住酒店 穿镶钻礼服", "男子跨省杀妻及妻弟媳 二审改判死缓", "萌娃上台演出后鞠躬磕头谢幕", "俄乌直接谈判结束 乌称“毫无成果”", "范丞丞喊孟子义李昀锐爸爸妈妈", "穆迪宣布下调美国主权信用评级", "美国消费者信心指数连续第5个月下滑", "中方：坚决反对美恶意打压中国芯片", "黄杨钿甜旧照曝光 网友发现满柜首饰", "美股收盘纳指本周累涨超7%", "刘晓庆否认偷税后举报人再发声", "钟楚曦这个回头好优雅美丽", "《歌手2025》首期排名", "希尔德：效力勇士是我最快乐的时光", "雅典卫城上空现“巨鞋”形无人机群", "国乒主力当陪练 王楚钦给男双备战", "福特烈马用纸填充车顶被质疑安全性", "黄政宇：战海港期待能延续良好态势", "记者：怀森在皇马年薪900万欧元", "亚太斯诺克首站选拔赛16强出炉", "阵风八九级！实拍北京大风：树木摇晃", "PEL春季赛总决赛落户济南", "以色列空袭也门港口致1死9伤", "公募机构掘金科技赛道", "哈斯勒姆：勇士这两年别想再夺冠了", "哪吒汽车在印尼市场为用户上门交车", "帕金斯：勇士必须得补强", "霍里：让我们把赞赏给兰德尔", "GAI说这个圈子混饭吃的人太多了", "周思成称考研界刘晓燕英语水平最差", "泰山队发布客战海港海报"]

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
