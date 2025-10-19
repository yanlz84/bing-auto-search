// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.362
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
var default_search_words = ["从“中国规划”看“中国之治”", "美用42款特种武器网攻“北京时间”", "大一新生家长提前“空巢”了", "毫厘之间铸造“中国精度”", "台风“风神”将带来暴雨大暴雨", "美军摧毁一艘“载有毒品”大型潜艇", "杨振宁生前美国办公室有人凌晨献花", "广州多人遭遇“快递骗局”", "中国拳王在澳遭袭致严重心理创伤", "友人追忆杨振宁：他其实还有一个遗憾", "姐姐亲自接18年前被抢走的弟弟回家", "山西辟谣3.9级地震致街面一片狼藉", "郑丽文回应当选中国国民党主席", "做梦梦到的人究竟和你是啥关系", "李连杰新身份：001号终身志愿者", "《爸爸去哪儿4》9年未解之谜破案了", "安世中国致全体员工：国内运营正常", "郭碧婷爸爸回应“女儿一人养家”", "日媒：高市早苗几乎确定胜出选举", "翁帆：杨先生离开的时候一定很欣慰", "杨振宁逝世", "吴石墓前祭奠的市民络绎不绝", "清华学生：杨振宁成就已超越诺尔贝奖", "052D驱逐舰专治“火力不足恐惧症”", "设计师回应“人体蜈蚣”雕塑争议", "29岁狼人杀主播“腿毛”离世", "被拐男孩母亲称没有养父母只有买家", "男子凌晨听到呼救发现一女子被勒昏", "苏州“十全街大馋狗”被全网围观", "白宫发言人就美俄峰会选址破防", "钓鱼巧克力大爷回应因黑走红", "揭秘“891工程”", "以军袭击加沙一车辆 致一家9人死亡", "北京山区下雪了", "贵州一20米下坡路装了16条减速带", "联合国秘书长警告：联合国或将破产", "男子救人被卷入大海 带血成功上岸", "国航客机空中起火 亲历者发声", "长期不动 银行卡被冻结怎么办", "走失女孩获救背后：近千人跨省救援", "百年一遇一眼千年！故宫“顶流”集结", "大降温持续 北方冷如常年11月", "郑丽文成国民党第二位女性党主席", "这4种电话 别接别回别点", "为什么AI写的文章总有一股“AI味”", "39年老警与11年警犬共同退休", "巴基斯坦和阿富汗同意立即停火", "医生建议老年人接种“疫苗三件套”", "月亮姐姐宣布离开央视少儿频道", "特朗普未明确拒绝向乌提供战斧导弹", "伊朗谴责以色列违反加沙停火协议"]

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
