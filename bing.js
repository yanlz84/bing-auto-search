// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.70
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
var default_search_words = ["习近平向中国西部国际博览会致贺信", "中使馆提醒：消除买外国媳妇错误思想", "王健林再卖48座万达广场", "美线货运订舱就像“抢票”", "朝鲜军需工业副部长李亨先被拘留", "美女机器人击倒对手后拍屁股挑衅", "王楚钦拿下三大赛单打首冠", "董明珠为什么愿意再次为孟羽童转身", "中央组织部部长：严肃处理违规吃喝", "孙悟空林黛玉CP爆火？六小龄童回应", "女子领低保炫耀炒股赚钱 官方通报", "孩子因学校不公平待遇跳楼？假", "以军令世界震惊 多国集体警告", "再这么下去苹果要吃不起了", "王楚钦心情大好买烟又买酒", "71岁赵雅芝演唱会上爆哭", "机器人出招就是“佛山无影脚”", "男子投资180万开超市 开业7天被举报", "南方最强降雨来袭", "女子拍照时坠崖身亡 当地回应", "高管开6辆保时捷不敢停公司", "国安部披露：涉密人员退休后被策反", "特朗普再次威胁哈佛", "吃了一块冰箱里的瑞士卷 老人去世", "高圆圆称90%的社交对她都是消耗", "高志凯：中国绝不允许你开第二枪", "特朗普放言：批量制造“大杀器”", "“迈巴赫少爷”父亲发文谈儿子绰号", "教师加班福利未发消极教学谁该负责", "孙颖莎复盘决赛：坦然接受各种变化", "凤凰传奇北京演唱会观众破纪录", "印度新娘承认另有所爱 最后时刻悔婚", "央视曝光小广告黑产链", "“短剧一姐”李沐宸拒演长剧惹争议", "孟羽童发文晒与董明珠合照", "王励勤总结国乒世乒赛表现", "机器人在格斗大赛打裁判", "白宫涉华事务人员全被解雇", "女子遗落300万翡翠被垃圾清运车收走", "卖5套房送儿留洋学足球当事人发声", "300万人选出最丑军训服 这事美在哪", "受党内严重警告2年后 他拟获提拔", "孙颖莎称和王曼昱都是胜利者", "哈佛中国留学生：没想到成历史一部分", "女儿被龙虾夹手哭着喊“妈妈抱抱”", "章子怡素颜带女儿看陈丽君演出", "男单夺冠后刘国梁王皓相拥大笑", "校长亲自干食堂 感慨：比外包难太多", "郑钦文两大劲敌全部一轮游出局", "只有杭州能找到5天不睡的电商主播", "副部级任上落马 精通笛子还会武术"]

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
