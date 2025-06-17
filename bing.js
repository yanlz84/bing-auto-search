// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.115
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
var default_search_words = ["为世界和平和发展作出更多贡献", "习近平：各方应推动中东局势尽快降温", "伊朗方面称击落第4架以军F35战机", "外贸高质量发展呼唤更多“爆款”", "外交部：正迅速组织从伊以撤侨", "华语乐坛泰斗陈彼得去世", "人贩子流窜到重庆巴南？谣言", "#杨幂赵丽颖出演的酱园弄是烂片吗#", "金建希入院原因曝光：抑郁症症状严重", "免签扩容带来服务贸易新机遇", "以军计划今晚袭击德黑兰重要目标", "伊朗：打击以色列的力度还将升级", "海口街头有幼童坐铁笼内 警方回应", "特朗普骂马克龙：想出名 总是搞错事", "一汽大众618限时狂欢", "一轮大范围强降雨来了", "泽连斯基：基辅等地遭俄大规模空袭", "以色列驻美大使：周四晚上有“惊喜”", "伊朗称不会让以色列有一刻安宁", "宋轶为躲代拍在机场狂奔", "杨坤和美女同回酒店 疑新恋情曝光", "泡泡玛特市值蒸发超200亿", "中使馆发通知：在伊中国公民尽快回国", "女子喉咙不适到诊所输液后身亡", "医生联系民营救护车 800公里收2.8万", "《酱园弄》第一波口碑两极分化", "男子吹一夜空调后面瘫 脸僵口歪", "上任4天 伊朗最高军事指挥官被打死", "加总理拍马屁：没有美国 G7啥也不是", "日本男子杀女网友分尸头盖骨藏家7年", "#美国是否会介入伊以冲突#", "6国联合欲施压美国 特朗普先跑了", "8岁男孩花1万多网购26箱荔枝", "特朗普卖“黄金手机” 定价499美元", "巴黎航展把以色列武器全部拉黑", "伊朗和以色列隔空展开攻防大战", "陈彼得曾称一定要回到故乡这是本能", "油价年内第五涨！加满一箱多花10元", "美驻以使馆：无法从以撤离美国公民", "河南军人张伟抢救画面曝光", "JCK觉城之夜N100", "医院缴费必须先帮工作人员扫码砍价", "雷霆击败步行者 总决赛3-2夺冠军点", "基辅遭空袭已致14人死亡", "老人被毒蛇咬伤：医生说比骨折还痛", "这么中那么燃 周末去河南", "美国“尼米兹”号航母改道驶向中东", "航拍俄战机轰炸乌军土坝", "这里美成中国国家地理封面", "中国记协就伊朗电视台遭袭发声", "外交部回应以军空袭伊朗国家电视台"]

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
