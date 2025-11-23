// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.432
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
var default_search_words = ["各国共同发展才是真发展", "顶住美国压力 G20峰会通过联合宣言", "高市幻想“软着陆”？中方明确表态", "回顾十五运会中的“湾区时刻”", "奥司他韦近7天销量上涨率达237%", "男子打卡世界第一长洞 失联6天生还", "电动自行车“挡风被”到底该不该用", "高市早苗在G20峰会迟到近1小时", "知名律师打羽毛球猝死 年仅43岁", "女生卖炒饭东北大哥急到自己颠勺", "女子为小11岁丈夫花六七十万直呼失败", "工业垃圾制造儿童面霜系谣言", "韩国决定：抵制日本活动", "亚洲最大船队将诞生", "日本人不敢相信自己眼睛", "张家齐宣布退役", "日本已付出代价", "突然爱上香菜可能因为你老了", "为啥山东运动员这么能拿奖牌", "女子称丈夫花8万元网购70平海景房", "70岁任达华不慎摔倒 眼镜被甩飞", "乌克兰：努力体面地结束", "“高市下台”响彻东京夜空", "多方就“28点”新计划发表联合声明", "“论中国小孩对晒被子的执念”", "美国两航母同日在南海一进一出", "白岩松：高市早苗“口嗨”后只能打脸", "13年前的今天“航母style”火遍全国", "能与20层楼比肩 福建舰之大具象化了", "有班级因流感半数请假学生停课", "男生剪发被收费1万 理发店：明码标价", "印度光辉战机坠毁 巴基斯坦防长发声", "曾因肥胖自卑的高中生狂揽健美大奖", "多个军方账号连日海外密集发声", "蔡磊：新药不能救我能救别人也开心", "多家航空公司取消往返委内瑞拉航班", "男子762元买20多件商品 蕉内拒发货", "上海一小区多套住房统一挂牌1460万", "尼日利亚一学校200多师生被绑架", "偷中国游客现金 日本机场安检员被捕", "村民讨要8年前2万元绝育保证金遇阻", "欧尔班：不接受继续资助乌克兰的建议", "女子光脚踩水族箱擦玻璃 超市回应", "央视起底豪车碰瓷特大骗保案", "村委会办公楼起火账本被烧？当地回应", "胡塞武装以“间谍罪”判处18人死刑", "过期药没变质就能继续用吗", "新央企开始组建 涉及人工智能等领域", "女子编造在三亚潜水被拔管 警方通报", "美国的“破坏法案”究竟想破坏什么", "上山放牧失踪3日的重庆女童找到了"]

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
