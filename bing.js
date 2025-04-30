// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.19
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
var default_search_words = ["总书记关心劳动者的十个微镜头", "苗华被罢免全国人大代表职务", "胡锡进：“董小姐”事件涉及机会公平", "来看看五一假期有哪些新玩法", "证监会副主席王建军被查", "揭密中国如何追踪美国特工", "山西太原爆炸已致1死21伤2失联", "鲁迅儿媳马新云去世 享年94岁", "刘德华：人在钱面前最现实", "三问肖飞董袭莹事件", "太原小区爆炸一男子上身伤痕累累", "重庆一小区3人被杀害分尸？假", "“董小姐”的种种疑云该有个说法了", "电梯内恐吓幼童的面具女已道歉", "日媒：上海车展掀起“飞行汽车”热潮", "巴方：印度恐将在24至36小时内动武", "中国排面亮相莫斯科", "航天员返回第一顿吃牛肉面驴肉火烧", "小伙西班牙遇小偷当场裸绞制服", "董袭莹规培后学术生涯如火箭般蹿升", "演员蒋依依姐姐被曝走后门进协和", "特朗普政府百日乱局遭辣评", "#李铁二审维持原判是否罪有应得#", "男子冰糖当毒品卖 10年后成放牛网红", "深圳水贝老板炒黄金亏了一个亿", "3名航天员着陆后状态良好", "饶毅回应曾怒怼协和“任人唯亲”", "上班时间抢小朋友烤肠 警犬被通报", "谢霆锋也有演唱会戒断反应", "毛晓彤在环球影城被偶遇", "专家称“4+4”初衷是培养医学领袖", "女子生理期弄脏店家多件新衣后拒买", "月嫂下户躲卧室抱着宝宝流泪", "沃尔玛称关税成本由美国客户承担", "孙颖莎当颁奖嘉宾了", "#被中西合璧非遗鼓上舞美哭了#", "63岁刘德华北京机场被偶遇", "民营经济促进法5月20日起施行", "越南统一50周年阅兵现场", "Makiyo回应杨丞琳方法律声明", "外交部回应解除对5名欧洲议员制裁", "大妈撞树硬核健身差点撞瘫痪", "五一出行必看的健康防护指南", "#被滥用的协和4加4项目错在哪#", "五一全国巡吃计划启动", "太原小区爆炸现场：居民玻璃被震碎", "迪卡侬传出售中国业务30%股权", "偶遇谢霆锋父亲谢贤坐轮椅出行", "河北省为林孝埈记大功", "美的集团完成收购Teka集团", "特朗普签署命令为汽车关税“降级”"]

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
