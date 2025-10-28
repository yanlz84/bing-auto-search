// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.380
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
var default_search_words = ["习近平参观故宫博物院展览", "00后用家用打印机造250多万假币", "新华社重磅发文！两岸统一有这些利好", "一揽子增量政策实施效果如何", "大量用户举报违规直播 微信：严打！", "央视曝光收割老年人的“风水大师”", "深圳地铁回应印度人在车上吃手抓饭", "从空姐到空嫂不只是一字之差", "孩子们满嘴“包的”“666”该怎么办", "俄方称在红军城方向包围乌军31个营", "男子盗窃后留字条“钱会还别报警”", "长白山天池水被“煮开”系谣言", "31省份去年婚姻数据公布", "美股收盘：三大指数齐刷历史新高", "停摆冲击！美国超3000架次航班延误", "这6类必须焯水的食物要知道", "伪造国安部红头文件 红汞骗局曝光", "新能源“烂尾车”困扰百万车主", "热门中概股集体上涨 百度涨近5%", "个人征信将可修复", "牛弹琴：南海成了美军的噩梦之地", "肉联公司门口堆满死猪 7人被控制", "23岁美国女孩寻找中国亲生父母", "辽宁通报“男子在酸菜池抽烟吐痰”", "广东人生娃积极性第一名", "现货黄金跌破4000美元/盎司", "熊孩子误吞10克金豆6天后排出", "渔民抓160斤巨型石斑鱼 多人拖上岸", "吴卓羲透露许绍雄病危昏迷未醒", "日本天皇用英语说很高兴见到特朗普", "正直播NBA：篮网vs火箭", "日本前首相安倍晋三遇刺案开庭", "神秘绿色球体划过莫斯科上空", "特朗普：很长时间内不想和加总理见面", "美国科技男也爱上“微整容”", "浙江多地为新婚夫妇“发红包”", "农妇收玉米时突遇山体坍塌失联超3天", "贵州茅台：董事长张德芹辞职", "蔡磊近况：全身瘫软 语言能力丧失", "王毅同美国国务卿鲁比奥通电话", "日本鸡蛋价格逼近历史最高值", "国家卫健委：别买直播带货的网红神药", "土耳其发生6.1级地震", "医生：运动受伤能活动不代表没骨折", "郑国霖谈景区打工：过气明星缺钱", "高通推出人工智能芯片后股价大涨20%", "老人高速逆行还疑推婴儿车？交警回应", "意法院批准引渡“北溪”案嫌疑人", "台湾一男子开敞篷跑车抢劫14万金链", "委内瑞拉总检察长：美企图推翻委政府", "解放军驻香港部队组织联合巡逻"]

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
