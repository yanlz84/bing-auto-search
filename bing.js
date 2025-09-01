// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.266
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
var default_search_words = ["习近平会见土耳其总统埃尔多安", "一等功爷爷送孙子去国防科大报到", "冷空气来袭 北方陆续开启入秋进程", "一颗纽扣 两个朋友", "清华女博士谈“勇闯”短剧圈", "陈咏诗获2025香港小姐冠军", "告别信息裸奔 国家网络身份认证来啦", "河南一幼儿园20元餐费能吃龙虾鲍鱼", "牛弹琴：会见莫迪中方三句话意味深长", "中国抗战：凝聚世界和平力量", "国羽男单时隔10年再夺世锦赛冠军", "业内辟谣大额存款利息收20%个税", "直击开学第一天", "“子涵梓萱”时代已经过去了", "多家银行准备就绪 贴息“红包”来了", "香港小姐14强佳丽均是高学历", "特朗普关税被判非法 印度肯定在庆祝", "新疆沙漠首次发现盐水丰年虾", "欧洲正在制定向乌克兰派兵具体方案", "胡塞武装称将对以军袭击发起报复", "中国女排无缘世锦赛八强", "樊振东德甲首秀2连败", "深圳一学校开学“书山”学生自己搬", "为什么吃海底捞前要先上个坡", "旺旺集团总经理：去看祖国的阅兵仪式", "刘强东“富贵归故乡”", "上合峰会外方领导人全部抵达天津", "手把手教你领到消费贷“国补”", "美国被披露：欲控制加沙地区至少10年", "世界羽联回应中国羽毛球价格上涨", "委防长：准备抗击美军“任何侵略”", "52岁村医与儿子考入同校同专业", "莫迪此访至少让特朗普失算了", "陈雨菲泪洒颁奖仪式", "张玉宁为“与球迷起冲突”致歉", "石宇奇羽毛球世锦赛男单夺冠", "陈雨菲赛前吃了8颗止疼药", "9月1日起全民交社保？专家：纯属误读", "国安俱乐部深夜向球迷道歉", "王丹妮为角色剃平头", "人形机器人会更快更高更强", "20省份实现生育津贴直接发放至个人", "30多万人攻坚造出国产大飞机", "英国拿下挪威天价军舰订单", "“陪爬”兴起 服务边界不能模糊", "男子花22天从北京跑到郑州", "泽连斯基：暗杀乌前议长的凶手已被抓", "石宇奇夺冠后发文：继续努力", "媒体评诊所用氯化钠代替破伤风针", "韩国医生辞职风波18个月后终平息", "中医药“圈粉”上合朋友圈"]

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
