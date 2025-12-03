// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.453
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
var default_search_words = ["“支持和鼓励残疾人自强不息”", "高市早苗称日本政府对台立场没改变", "中方回应特朗普签署涉台法案", "攀登吧！向上生长！", "王毅外长风衣配红围巾迎接马克龙", "店内环境太差 取完餐外卖员差点吐了", "特朗普“点名”日本", "荒野求生林北退赛 获得2000元奖金", "骑电动车还能带孩子吗？解读来了", "高市早苗老家奈良凉了", "受贿1.02亿余元 李刚一审获刑15年", "四川绵阳发生山体火灾系谣言", "吴建豪暴瘦 身高1米8仅100斤", "高市早苗又现眼 日本网民惊呆了", "夫妻花500多万买别墅 违建面积200平", "34岁女药品销售员陪酒后身亡", "烟花店老板举报官员后自杀？妻子回应", "失踪11年 马航MH370残骸搜寻重启", "17个省份流感达到高流行水平", "马克龙将访成都 想再租借大熊猫", "法国总统马克龙抵达北京 开启访华", "突发！快船官宣与保罗分手", "香港大埔火灾已造成159人遇难", "郭正亮：若日本军事介入台海视同侵略", "香港警方就大埔火灾再拘捕6人", "网信部门查处网络名人账号违法行为", "石破茂反问：还记得那时日本的结局吗", "工行三年期大额存单门槛提至100万", "传染病来袭 有班级停课学生上网课", "台湾前途只能由14亿多中国人民决定", "内塔尼亚胡求特朗普：再帮帮忙", "上野千鹤子批高市：真是亡国内阁", "中超国内球员税前年薪500万封顶", "重庆一轿车违规掉头撞上装甲车", "妻子为孩子花15800后丈夫坦白离职", "香港火灾楼宇内部搜索已全部完成", "呼吸也能调心情 记住“478”口诀", "金建希出庭受审 低头被两人搀扶", "女子和同居男友杀人抛尸 命案告破", "女生诉父亲付研究生费用被法院驳回", "城管局副局长酒后袭警？当地通报", "一自闭症机构搬进社区被居民驱逐", "马航MH370年初曾秘密搜寻无果", "韩国发生袭击事件 2人心脏骤停", "湖南省人大常委会原副主任叶红专被查", "“零公里二手车”被曝灰色流通", "央视起底骗保黑灰产业链", "扳倒井560吨原酒被法院拍卖", "央企中信集团组建新公司", "外交部：中俄达成新的共识", "河北小伙开挖机游全国 帮环卫工清雪"]

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
