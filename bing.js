// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.274
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
var default_search_words = ["习近平重点强调这些历史启迪", "他在阅兵现场留下不能露面的照片", "九三阅兵震撼岛内 赖清德看懂了吗", "这些受阅武器装备震撼亮相", "央行开展10000亿元买断式逆回购操作", "男子诋毁九三阅兵被拘", "金正恩乘专列离京返程", "普京称将回应中国对俄试行免签", "官方回应102岁老兵看完阅兵后去世", "小伙在新疆“找矿”却因喂牛走红", "张亮麻辣烫没张亮了", "校方辟谣“54岁阿姨上岸硕士”", "美股收盘：科技巨头集体走强", "特朗普签令 正式实施美日贸易协议", "呼吁开除“最快女护士”言论越界了", "乔治阿玛尼离世 享年91岁", "特朗普下令对“毒贩”开火 引发争议", "26国将向乌克兰部署军队", "阅兵式上有“错字”? 真相来了", "串串店老板看完阅兵请客：花了6万", "九三文艺晚会总导演原来是她俩", "和平鸽每只有15元“工资”", "九三阅兵的覆盖全球实锤了", "中方驳斥特朗普涉中俄朝三国言论", "执勤军人纹丝不动 阿姨不停给其扇风", "兄弟俩十年三次在屋顶看阅兵", "19岁女生在阅兵仪式上担任长号手", "中小学生午休课桌椅有了国家标准", "特朗普宴请科技大佬 唯独少马斯克", "1949→2025 毛宁发布中国阅兵对比照", "父亲儿子都牺牲了 他带照片看阅兵", "阅兵的“机器狼”与机器狗有啥区别", "国台办痛批赖清德对阅兵说三道四", "在抵达天安门前返航 他们一样光荣", "看阅兵的“最高机位”！卫星视角来了", "装备方队唯一“女教头”超帅", "民兵方队领队：向右看时最震撼", "中国与古巴联合声明", "“麒麟芯片”再度现身华为发布会", "油菜籽出口中国遇阻 加拿大急了", "美食博主探店3年确诊糖尿病", "幼虎咬伤女童或与动物卡通化有关系", "她替儿子现场观礼九三阅兵", "九三阅兵 我们表达了什么", "小伙豪饮火锅汤后痛风发作无法行走", "华盛顿起诉特朗普政府非法派兵", "特朗普称将很快与普京通话", "军迷不语只一味生产表情包", "耿爽：未向俄乌冲突任一方提供武器", "王莉霞辞去内蒙古自治区政府主席职务", "拜登再次接受皮肤癌手术"]

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
