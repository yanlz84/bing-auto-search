// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.69
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
var default_search_words = ["习近平向中国西部国际博览会致贺信", "孙颖莎击败王曼昱卫冕女单冠军", "孙颖莎哭了", "中国经济靠什么“顶住了压力”", "校长亲自干食堂 感慨：比外包难太多", "中央组织部部长：严肃处理违规吃喝", "网警重拳出击 摧毁一网络水军团伙", "高志凯：中国绝不允许你开第二枪", "王曼昱扔球拍都没救到球 无奈叉腰", "张纪中74岁寿宴上称自己是少年", "大学生200元的成本干了20亿的项目", "交警辟谣高速时速不超143km不被罚", "央视报道国产5nm芯片华为麒麟X90", "71岁赵雅芝演唱会上爆哭", "凤凰传奇北京演唱会观众破纪录", "特朗普告诫军校毕业生：别找花瓶老婆", "杨采钰新恋情曝光", "副部级任上落马 精通笛子还会武术", "5A景区为什么干不过商场小火车", "雨果：王楚钦或是现役世界最佳", "灰鹤误入动物园虎区遭七虎围猎", "比亚迪宣布22款车型限时降价", "内蒙古现“落日彩虹” 持续近50分钟", "当斧头帮舞遇上沪上小阿姨", "全智贤白色抹胸伞裙", "广西1300年荔枝树采摘权1元起拍", "以为潘长江在南昌被围攻了", "日本巡逻艇在敏感海域开枪发射实弹", "特朗普放言：批量制造“大杀器”", "特朗普正威胁苹果 自己iPhone响不停", "全球首个人形机器人格斗大赛开打", "AI独角兽崩塌 全是印度程序员冒充", "警员视力矫正后因难忍副作用自尽", "哈佛禁招令或致未来女王无法毕业", "只有杭州能找到5天不睡的电商主播", "受党内严重警告2年后 他拟获提拔", "高圆圆称90%的社交对她都是消耗", "印尼总统：向中国表达我的敬意", "章子怡素颜带女儿看陈丽君演出", "桂林山洪村民楼房几秒钟平移20米", "消失的ATM机：全国仅剩80万台", "吃了一块冰箱里的瑞士卷 老人去世", "哈妮克孜因为戴眼镜探班被换角", "严重违纪违法 李工被开除党籍", "台湾女子骑车连闯红灯失控自撞身亡", "儿童疑触碰路灯电桩身亡 有电击痕迹", "有00后称从来没用过ATM机", "女子领低保炫耀炒股赚钱 官方通报", "300万人选出最丑军训服 这事美在哪", "这样的“醉驾”能从轻处理", "博主称上海快餐四菜一汤173元"]

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
