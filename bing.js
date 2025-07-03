// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.146
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
var default_search_words = ["一封特殊的入党批复函", "“本升专”竟然成真了", "特朗普：美国和越南达成贸易协议", "闻“汛”而动 冲锋在前", "上海一大学学费15万1年 校方：不盈利", "《家有儿女》小雨变成暴雨了", "高考志愿填报启动 网警继续护航", "埃菲尔铁塔被热到弯曲偏斜", "00后女子在沪俩月 消费全靠找茬赖账", "《亮剑》原班人马拍短剧", "山东舰航母编队访问香港", "广东中考考前试题泄露？官方通报", "警方通报南航员工伤人：已跳楼身亡", "5层楼因暴雨垮塌 房主在外挣装修钱", "美股收盘：标普纳指新高 特斯拉涨5%", "五台山僧人将米扔出殿外 被劝返回家", "女装为什么变得又贵又难穿", "记者调查隐藏摄像头售卖乱象", "联合国秘书长：地球越来越危险", "移民监狱鳄鱼恶魔岛隐藏着什么恶魔", "尤浩然回应小雨变暴雨", "上海交大通报学生疑被校外人员殴打", "U19男篮：中国86-99不敌新西兰", "公交司机要求乘客抱起婴儿才能开车", "伊朗：敌人再侵略将做出毁灭性回应", "印尼一艘客轮在巴厘海峡沉没", "美众议院会议讨论“大而美”法案", "73岁“女儿国国王”朱琳近照曝光", "伊朗承认：核设施严重受损", "热播剧男星遭“釜山行式围堵”", "大而美法案在美众议院通过概率多大", "华东理工大学回应学费上涨", "王嘉尔反驳印度主持人引导式提问", "小沈阳力挺女儿：我们家不看成绩", "迪拜完成空中出租车试飞", "含“刑”量最高的作家开始搞音乐了", "雷军：大概2027年才会考虑汽车出口", "天津一公司体罚员工“狗爬”50多圈", "北京现代6月销量环比增长66%", "曝娜扎张云龙近况", "周星驰周杰伦梦幻联动晒合照", "董明珠落榜2025财富中国商界女性榜", "欧盟委员会主席冯德莱恩会见王毅", "与尿毒症父亲相依为命 女孩考637分", "SU7转单数不足YU7总订单的15%", "美政府扣留近70亿美元学校资金", "外资机构看好中国科技和消费潜力", "近600人在美以支持的援助分发点被杀", "石破内阁首次参议院选举拉开帷幕", "鲍威尔称若无关税政策美联储已降息", "李一桐再回应拍戏时蜈蚣爬上衣服"]

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
