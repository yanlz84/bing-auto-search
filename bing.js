// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.184
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
var default_search_words = ["历史深处守望“有记忆的城”", "英法等25国发表联合声明", "俄罗斯商品馆成了“时代的眼泪”吗", "11.23亿！你是其中之一", "莫斯科遭大规模袭击引发机场混乱", "男生636分报福耀科技大学", "郑州一饮用水源地成天然浴场谁来管", "16位中央巡视组组长已全部确定", "台风过后广东一海滩现大量生蚝", "广电总局发文：杜绝抗战“神剧”", "黄轩晒健身照体重仅60公斤", "5岁女孩独自在家未开空调猝死？假", "山东一地多人哄抢掉地大蒜", "姐弟俩为争300万遗产发现均非亲生", "三大运营商表态：精简套餐 资费透明", "航班凌晨广州飞广州 航司回应", "被印度人取笑后 这架F-35终于要走了", "成都一8岁女童在小区内被车撞倒身亡", "捏造“粪水”谣言 邵某豪被刑拘", "牛弹琴：法国又乱套了 乱得匪夷所思", "王琳回应被儿子掌掴传闻", "中国女子在美国找工作遭绑架性侵", "中国企业获达尔文港租约 外交部回应", "武汉公安真摇来任贤齐宣传反诈了", "交警小哥泪奔被同事暖心安抚", "甜馨晒童年与李小璐合照维护妈妈", "上海海洋水族馆元老级石斑鱼离世", "美移民监狱被曝虐待：有人跪着进食", "美国再次将核武器部署至英国", "旺仔小乔曾说不露脸是因遭遇骚扰", "罗马仕现状：还剩5千万库存", "胡友平获“全国见义勇为英雄”称号", "女生遭男友殴打致残 法医不予鉴定", "考生晒未被云南大学录取备注总分低", "救护车拉走溺水者仍有游客要下水", "“爆冷”的风刮到了浙大医学类专业", "郑钦文退出美国网球公开赛", "火锅英雄栾留伟获国家表彰", "王化回应小米摄影图涉嫌抄袭特斯拉", "中央巡视组进驻广东省 联络方式公布", "美政府公布FBI关于马丁路德金的记录", "“外卖大战”长期化意味着什么", "机场旅客非法携带子弹 警方通报", "阿富汗首都喀布尔5年后或无水可用", "以军坦克首次进入代尔拜拉赫", "法新社称其驻加沙记者“濒临饿死”", "伪造“蓝底白字”通报必须受到严惩", "俄对乌大规模空袭致17死伤", "1年360万 保罗重返快船", "伊朗外长称愿意参与谈判", "小米REDMI首部短剧《时空合伙人》收官"]

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
