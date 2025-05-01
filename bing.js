// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.20
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
var default_search_words = ["挺立潮头开新天", "国家卫健委调查肖某董某及有关机构", "美方多渠道主动接触中方希望谈关税", "中国成为世界确定性之锚", "冲着月薪一万应聘九天到手一千", "以色列向多国求援灭山火", "2人造谣登顶泰山奖3万被罚", "老祖宗看我穿一身聚酯纤维都能笑了", "乌美签署矿产协议", "张新成李兰迪疑似已分手", "河南一企业发生爆炸致1死3伤", "重庆一小区3人被杀害分尸？假", "印巴再次交火 双方战机对峙", "斯诺克世锦赛4强出炉", "台军首艘自造潜艇被爆进水出故障", "杜海涛约女明星吃饭", "12306五一前大量放票？客服回应", "C罗无缘亚冠决赛", "#李铁二审维持原判是否罪有应得#", "“董小姐”的种种疑云该有个说法了", "特朗普称美国即将迎来好日子", "巴基斯坦军方：巴印战机短暂对峙", "印度宣布对巴基斯坦航班关闭领空", "贾玲43岁庆生照曝光 本人超瘦", "俄罗斯女孩河南拜师学习非遗牛皮鼓", "太原小区爆炸现场：居民玻璃被震碎", "多哈世乒赛吉祥物亮相", "新加坡游客称中国最安全 30天不够玩", "专家称班凯罗预计签5年2.47亿合同", "有协和4加4博士论文正文仅12页", "杨紫无缝进组 将与胡歌首次合作", "董某莹父亲是国企总经理？官方回应", "董袭莹的“跨界”疑云有谁在紧张", "小图拉姆欧冠开场30秒破门", "海南机场：拟收购美兰空港50.19%股权", "倪妮：妈妈刘德华给我唱歌了", "南京鼓楼医院院长被人尾随砍至重伤", "微软：第四财季Azure将增长34%", "名宿：东部只有骑士绿军能进总决赛", "女子生理期弄脏店家多件新衣后拒买", "巴萨3-3战平国米", "#被滥用的协和4加4项目错在哪#", "崔康熙回应右路球员伤情", "一文详解美乌矿产协议", "以色列宣布进入国家紧急状态", "两大叔圈天菜终于又合作了", "王楚钦张本智和世乒赛同半区", "4月全国电影总票房11.92亿", "《我们与恶的距离2》发布首支预告", "多家公司年报后“摘星脱帽”", "尤斯特：国米是欧洲最好四支球队之一"]

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
