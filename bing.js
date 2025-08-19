// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.240
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
var default_search_words = ["读懂“两山”理念的天下情怀", "泽连斯基再见特朗普 这次穿西装了", "多地暂停汽车“国补” 怎么回事", "一组数据带你回顾2025世运会", "胖东来招保安要求本科 人社部门回应", "特朗普泽连斯基会晤 白宫挂了张地图", "小米车主撞死4人亮贫困证？当地通报", "小伙送外卖结识美籍幼师5个月闪婚", "牛弹琴：特朗普果然大杀四方", "五年级小学生摆摊卖奶茶月入4000", "父母悬赏上海一套房寻被拐26年儿子", "这些诈骗套路专盯你的钱", "泽连斯基改了着装 10秒说4次谢谢", "俄罗斯外长的卫衣火了", "主动投案的谭队长 牵出系统性腐败", "长沙湘江特大桥突发大火", "孩子脱鞋138cm补票后家长投诉退票", "曾轶可演唱会取消 主办方：回不了本", "爸爸带两娃从深圳徒步回长沙", "今日出伏 三伏天正式结束", "马景涛女友：我爸跟马哥同龄人", "青铜器展柜内有一部手机 博物院回应", "泽连斯基再进白宫 和特朗普聊了什么", "特朗普突然中断会晤 给普京打电话", "特朗普：开始安排普京泽连斯基会晤", "特泽会后 特朗普与普京通话40分钟", "河北一马路设5个大水泥墩 当地回应", "海南一地研究生学历月薪三千", "60岁李国庆谈再婚：妻子是“白月光”", "特斯拉6座Model Y L上市 33.9万元起", "“职业背债人”200万买断人生", "女子只顾聊天婴儿车掉进鱼塘", "山东省女厅官张青青被“双开”", "#本轮A股牛市原因是什么#", "女子扶摔倒环卫工反被对方责骂", "男子与儿子认亲2年后又一个儿子找来", "男子放弃继承亡父房产 法院：无效", "NBA球星来中国一趟什么都想带回家", "印度女留学生吐槽韩餐肉太多", "“超级英雄电影”为什么不灵了", "人民日报对话于东来：用真诚换取信任", "2名日本人在菲律宾遭枪杀 监控曝光", "外交部：所谓“旧金山和约”非法无效", "特朗普：不再送而是卖武器给乌克兰", "美国女市长被曝婚内与保镖偷情", "外交部回应德国外长涉华言论", "泽连斯基称愿与普京会面", "一起来北京大学开学报到", "暴雨大风积水内涝 北京三预警齐发", "男子讲述被毒蛇咬伤拦车自救经历", "原南京军区副司令员林炳尧将军逝世"]

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
