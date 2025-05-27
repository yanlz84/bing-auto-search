// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.72
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
var default_search_words = ["孩子们成长得更好是我们最大的心愿", "马克龙回应被老婆打脸：夫妻间闹着玩", "王健林已被冻结4.9亿股权", "“中国游”带火“中国购”", "姚安娜：还好从哈佛毕业了", "银行为新存千万客户子女推名企实习", "西方不再限制援乌武器射程 俄方回应", "医学泰斗病逝当天还在医院上班", "陕西版“孙小果”获死刑 曾纸面服刑", "王菲谢霆锋在日本被偶遇", "张一山生日赵丽颖送了两巴掌", "研究生夫妻抱孩子从25楼跃下？假", "这家5元自助快餐店因一条差评火了", "男星张翰被起诉", "魏建军称汽车届的恒大已存在 会是谁", "俄方回应特朗普批评普京：他情绪化", "陈芋汐与新搭档夺冠后牵手领奖", "女海归家门口被捅死 凶手称正当防卫", "教授称广东人用开水烫碗令人恶心", "李微微从教师到正处级干部仅用4年", "女子转账输错号码 转给陌生人1000万", "70岁周润发又被偶遇爬山 沧桑了不少", "杭州那只外逃4年的豹子怎样了", "女子手链丢失 拾得者开价800元每克", "玲花也不唱了 曾毅惊呆", "成都女子家门口遇害案细节曝光", "女子分享孕期分娩后容貌变化", "连续三天23点半后入睡就是熬夜", "今年争议最大的国产剧来了", "小沈阳把张百乔拉黑了", "男子玩滑翔伞被吸至8千米高空生还", "河南一景区月薪3万招帅气NPC", "普京所乘直升机遭无人机大规模袭击", "盈都来董事长：取名胖都来不后悔", "陈芋汐与新搭档掌敏洁10米台夺冠", "20寸行李箱被要求托运 首都航空回应", "男童因伤退出孙继海青训被索要18万", "李在明最新涉华表态", "OpenAI模型破坏脚本拒绝自我关闭", "中国将撒哈拉沙漠改造成甜菜农场", "商场内男孩被食物卡喉 路过医生施救", "四川版泰坦尼克号开建11年仍未完工", "谢娜：小朋友你长大一点再来看哟", "贾玲全资持股大碗娱乐", "汽车冲撞英超冠军游行人群已致27伤", "雷霆vs森林狼", "林俊杰演唱会突发意外", "以军在加沙街头射杀运粮马", "朱媛媛最后的日子在福建度过", "印专家：印度将超德国 成第3大经济体", "港星发文求工作 或因欠租无家可归"]

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
