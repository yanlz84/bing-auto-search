// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.455
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
var default_search_words = ["习近平同法国总统马克龙举行会谈", "“我今年已经96岁 不能等了”", "台媒：台当局称封锁小红书一年", "流感高发期 请查收科学防护指南", "彭丽媛同法国总统夫人参观北京人艺", "商务部回应“是否反制日本”", "韩国标示“中国台湾” 台当局急了", "中方举行欢迎仪式 马克龙献上飞吻", "香港特区政府：已收到捐款28亿港元", "越来越“美”的旅游", "培植个人势力 蓝天立被“双开”", "新国标电动车时速超25公里断电不实", "19岁小伙不会游泳 为救跳河女友溺亡", "打印微信作业何以难倒万千家长", "喜欢开倍速看视频的人天塌了", "今年最后一次“超级月亮”来了", "美国女子脑死亡被迫生下孩子", "高市早苗被控涉嫌违规收受企业捐款", "丝滑！导弹直角转弯咻一下就飞出去了", "新国标实施有电动车门店3天没开单", "马克龙为何参观“乾隆花园”", "女子坐电瓶车摔倒 头被鲨鱼夹扎破", "#新国标电动车为何引众人吐槽#", "中方绝不接受高市用“立场没变”敷衍", "塔斯汀90天关了907家店", "新疆阿合奇县发生6.0级地震", "宇树发布两款人形机器人实战视频", "乐视网负债238亿拟花1.8亿炒股", "今年全球5岁以下儿童死亡数或将上升", "日本网站现“抹黑中国人”招聘信息", "父亲1天干20个小时筹钱救患癌女儿", "34岁教授王虹两月内连获4项数学大奖", "陈伟霆“河南分霆”喷火受伤", "新能源汽车购置税免征进入倒计时", "新动作！日本欲打造“宇宙作战集团”", "商务部：开展稀土相关物项出口管制", "东部战区战机曾在远海突遇险情", "太阳脸上长雀斑：个头不小数量可观", "高市早苗任命的多名高层被告发", "学校流感及时停课 避免学生带病上学", "中国人民大学食堂推“中药代茶饮”", "马克龙访华第二站除了熊猫还有啥", "同一天 南北温差超过了60℃", "国乒战胜法国队 取得6连胜", "新东方回应员工发文控诉加班遭秒删", "黑珍珠餐厅遭差评后设耻辱榜自省", "入室抢婴案主犯被判死缓后当庭大骂", "羽绒服翻新 还得“翻”出诚信来", "神二十一航天员将择机出舱", "外卖新国标：禁止平台强制商户促销", "澳大利亚宣布向乌提供新的军事援助"]

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
