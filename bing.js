// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.134
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
var default_search_words = ["守住耕地这个命根子", "国防部回应网友许愿苏超决赛飞战机", "充电宝召回风波持续发酵 国家出手了", "六部门联合划重点、指方向", "暴雨蓝色预警：多省份大到暴雨", "雷军：未交付SU7都可改配YU7", "网警公布打击谣言8起典型案例", "小米YU7标准版定价25.35万", "“全球第一网红”也想来中国", "哈尔滨高温 高校学生楼道睡觉", "女生在公司午休一觉睡到五点半", "扁担女孩考527分？班主任辟谣", "丁俊晖因称“球桌像屎一样”遭罚款", "工人徒手掰断钢筋？河北通报", "哈梅内伊：伊朗给了美国一记耳光", "小米YU7 3分钟大定突破200000台", "美公布打击伊朗巨型钻地弹试爆画面", "日本回应特朗普将伊朗和广岛并论", "闫妮红毯又“微醺” 太松弛像在遛弯", "原来刘亦菲吃饭也是手机先吃", "以方：曾计划暗杀哈梅内伊但没机会", "《狂飙》唐小虎扮演者孙岩儿子出生", "男生高考697分用播音腔淡定报分数", "国防部：祖国的“战鹰”时刻在战位", "杨瀚森NBA合同总额过亿元", "吃2颗荔枝后测出“酒驾” 交警回应", "上海东方明珠玻璃地板疑似热炸", "马英九率台青参访敦煌莫高窟", "女子吐槽买桃子垫纸是卫生巾边角料", "小米发布AI眼镜", "妻女患癌 95后丈夫直播跳舞赚治疗费", "山西一疾控职工冒领养老金69万元", "吉林大学学生因宿舍太热支帐篷过夜", "杨瀚森成中国第三位NBA首轮秀", "68岁大爷全身重彩刺青肠子都悔青了", "家暴纵火案儿子跟父亲家亲戚断联", "马克龙：法不接受不对等欧美关税协议", "雷军：YU7订单要高于SU7", "印巴防长在中国同框", "尤文图斯vs曼城", "张帅第11次入围温网正赛", "#暴雨肆虐下的贵州黔东南#", "雷军：小米不是靠营销赢", "白俄防长：来青岛必须喝啤酒吃蛤蜊", "湖北宜昌市远安县发生3.4级地震", "云南玉昆2比1河南", "荣耀正式启动A股IPO", "小米手环10正式发布 269元起售", "伊外长称目前没有重启核谈判计划", "小米YU7四个色系九种颜色车漆", "神二十乘组圆满完成第二次出舱活动"]

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
