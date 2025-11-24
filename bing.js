// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.434
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
var default_search_words = ["脚要踩在大地上", "高市既想对华倒打一耙 又急于翻篇", "泽连斯基就美乌会谈发声明：达成共识", "闪耀全运会的青少年", "小鹏脚夹门事件员工被顶格处理", "G20大合照高市早苗夹缝中尴尬陪笑", "航行警告：刘公岛东部水域实弹射击", "全球最大、国内首条 多领域迎新突破", "印度全面恢复中国公民旅游签", "山东邹平成立“三无飞机”调查组", "“草根网红主播”批量撤离杭州", "河南一地铁站附近车祸致8死系谣言", "中国对日本的最新警告很不一般", "男子钓到108发子弹以为是大鱼", "C罗惊世倒钩闪耀沙特赛场", "男孩发烧十几个小时 退烧后脸变黑", "美乌发布联合声明", "美乌罕见共同定调：会谈“富有成效”", "全运会铜牌小伙撞脸《甄嬛传》沈眉庄", "冬天咬人的蚊子已经出现了", "警方回应印度旅游团义乌偷东西", "多位专家学者被指与郭伟有关联", "女子患病竟收到陌生女人电话催离婚", "谁在贩卖三无“野生”飞机", "巨型吊牌能否整治“穿完就退”", "日本网民批高市早苗：去中国道歉", "眼科医生提醒：近视的人少吃甜食", "低价合金饰品致癌物超标9000多倍", "12岁失联双胞胎姐妹已找到", "高市狂妄言行背后是错误历史观作祟", "大回暖后又是冷冷冷", "缅军再清剿KK园区 嫌犯抱头蹲街边", "黄豆豆破格提拔为副局级干部", "驻日美军基地毒蜘蛛“疑似外溢”", "RNGM久酷连接成功", "正直播NBA：马刺vs太阳", "正直播NBA：魔术vs凯尔特人", "特朗普称乌对美方努力毫无感激之情", "“偷甘蔗”农场新规：被逮到表演才艺", "史上最薄iPhone初期销量远逊预期", "云南彝良通报“大量垃圾倾倒山中”", "王毅连用3个“绝不允许”划下红线", "万岁山武侠城10个月营收突破10.68亿", "美乌首轮会谈结束 双方称取得进展", "书法家回应特等奖被取消：拉票没证据", "王毅：高市越了红线 中方必须回击", "茅盾文学奖得主王火逝世 享年103岁", "李嘉欣晒与许晋亨合照庆祝结婚17年", "小区快递站门口摔伤 谁该担责", "88岁老师再上讲台给花甲学生上课", "村里小孩自愿当偷甘蔗农场NPC抓人"]

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
