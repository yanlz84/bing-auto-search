// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.244
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
var default_search_words = ["习近平接见西藏各族各界代表", "高温+暴雨+强对流三预警齐发", "“强制社保”是咋回事？新规6问6答", "九三阅兵将有装备首次公开亮相", "“00后”勇闯牛市：赚钱就是股神", "千百惠为子起名有深意：爱国理所应当", "净网：警惕因支付密码简单而被盗刷", "31岁男子地下车库被发小杀害", "男子水下憋气29分钟刷新世界纪录", "男子钓了一条大鱼 妻子情绪价值拉满", "霸占侄女房子的姑姑一家有540平房子", "云南玉溪进城区须缴费200元？假", "老人未去世就被要求火化？当地致歉", "得知俩孙子均非亲生后奶奶崩溃", "于正回应杨幂靠新剧翻身", "“续面风波”中最稀缺的是理性", "普京提议在莫斯科会晤 泽连斯基拒绝", "昆明台记者采访被打受伤 涉事人被拘", "九三阅兵训练“治愈强迫症”", "陈奕迅首次公开袒露毕生遗憾", "武汉大学肖同学的处罚公告被隐藏", "3万金镯子被猫推进垃圾桶后丢失", "62岁千百惠因病去世 上个月刚抱孙子", "两子非亲生案前妻同意精神赔偿", "瑞典大满贯国乒男单仅剩林诗栋", "全球“最毒”的蚊子为何批量北上", "千百惠曾谈衰老：坦然面对老去", "男子离婚冷静期毒杀儿女案今日开庭", "法国一受虐博主在直播中死亡", "网约车平台集体降抽成", "俩儿子非亲生案男子喊话前妻道歉", "千百惠突发疾病去世 两月前还在带货", "信息支援部队工程大学迎新现场", "钟南山谈人工智能能否替代医生", "四川卫健委：非婚生子领补贴需结婚证", "“广东录像厅杀人案”3名凶手获死刑", "瑞典大满贯：张本美和爆冷出局", "特朗普：乌不该挑战比自己大10倍国家", "被蛇咬可以用嘴吸出毒血吗？", "好友：千百惠最无忧无虑的日子在成都", "歌手千百惠去世 代表作《走过咖啡屋》", "湖南一酒店被曝床单有血迹 当地回应", "美墨边境墙将被整体涂成黑色", "俄公布日本731部队细菌战解密文件", "波兰东部一不明物体坠落农田并爆炸", "钟南山谈儿时在南京遭遇日军轰炸", "一家9口吃鹅膏菌中毒", "中国女民兵太飒了", "抢先看！阅兵训练高清大图", "千百惠生前定居成都 隐退后仍在练歌", "2025年两院院士增选候选人名单发布"]

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
